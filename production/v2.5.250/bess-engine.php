<?php
/** Server-owned BESS simulation. All times are UTC epoch seconds; energy uses real elapsed time. */
final class Bargheto_City_Bess_Engine {
    private static function clamp($x, $lo, $hi) { return max($lo, min($hi, $x)); }

    public static function snapshot($b, $time, $world, $timezone, $seconds = 1) {
        // Installed inventory is shared with the scene: each rendered module is 620 W STC.
        static $array = null;
        if ($array === null) $array = json_decode(file_get_contents(__DIR__.'/game/dist/solar-array-config.json'), true);
        $bankCounts = $array['bankCounts'];
        $hour=12; $height=sin(deg2rad($array['sunElevationDegrees']));
        $cloud=44; $baseCloud=44; $ambient=29;
        $sky=self::clamp((1080*pow($height,.78)+85*pow($height,.35))/1000,0,1)*.82;
        // These physical racks are fixed; the old sky-sample switch cannot alter their output.
        $alignment=max(0,cos($array['tiltRadians'])*$height+sin($array['tiltRadians'])*cos(deg2rad($array['sunElevationDegrees'])));
        $derating=self::clamp(1-.0035*max(0,$ambient+$sky*22-25),.75,1);
        $trackers=array_map(function($count) use ($array,$sky,$alignment,$derating) {
            return $count*$array['moduleWatts']/1000*$sky*$alignment*$derating;
        }, $bankCounts);
        $pv=array_sum($trackers);
        $capacity = 12*$b['health']/100;
        $stored = $capacity*$b['soc']/100; $reserve = $capacity*.1;
        $bus = $b['powered'] ? $pv*.96 : 0;
        $demand = $b['loadKw']; $solarToLoad = min($bus,$demand);
        $spare = max(0,$bus-$demand); $deficit = max(0,$demand-$bus);
        $seconds = max(.001,$seconds);
        $charge = $b['powered'] ? min(2,$spare*.95,max(0,$capacity-$stored)*3600/$seconds) : 0;
        $discharge = $b['powered'] ? min(2,$deficit/.95,max(0,$stored-$reserve)*3600/$seconds) : 0;
        $loadServed = $solarToLoad+$discharge*.95;
        $voltage = self::clamp(350+$b['soc']*.55+($charge-$discharge)*.6,300,500);
        $losses = ($b['powered'] ? $pv-$bus : 0)+$charge*(1/.95-1)+$discharge*.05;
        return ['panelCount'=>$array['moduleCount'],'moduleWatts'=>$array['moduleWatts'],'peakKw'=>$array['peakKw'],'pv'=>$pv,'charge'=>$charge,'discharge'=>$discharge,'voltage'=>$voltage,'current'=>($charge-$discharge)*1000/$voltage,
            'sky'=>$sky,'hour'=>$hour,'trackerPower'=>$trackers,
            'weather'=>['ambientTemp'=>$ambient,'cloudCover'=>$cloud,'baseCloudCover'=>$baseCloud],
            'solarToLoad'=>$solarToLoad,'loadServed'=>$loadServed,'unserved'=>max(0,$demand-$loadServed),
            'curtailed'=>0,'gridExport'=>max(0,$spare-$charge/.95),'batteryLosses'=>$charge*(1/.95-1)+$discharge*.05,'losses'=>$losses,'demand'=>$demand,'stored'=>$stored,'reserve'=>$reserve];
    }

    public static function advance($b, $now, $world, $timezone) {
        // Upgrade starts at installation/first access, never invents consumption before this engine existed.
        if (($b['engineVersion'] ?? 0) !== 2) {
            $b['simulatedAt'] = $now; $b['engineVersion'] = 2;
            $b['generationHistory'] = []; // Do not label legacy 2.2 kWp history as the new array.
            unset($b['observedAt'], $b['observedPv'], $b['observedTrackers']);
        }
        $t = min($now, (float)$b['simulatedAt']);
        $gap = $now-$t;
        $oldStep = max(300, $gap/15000);
        $b['socHistory'] = array_values(array_filter($b['socHistory'] ?? [], function($p) use ($now) {return $p['t']>$now-86400;}));
        $b['generationHistory'] = array_values(array_filter($b['generationHistory'] ?? [], function($p) use ($now) {return $p['t']>$now-86400;}));
        while ($t < $now) {
            // Fine sampling for the displayed 24h, bounded work for a long-unvisited installation.
            $dt = min($now-$t, $t<$now-86400 ? min($oldStep,$now-86400-$t) : 30);
            if (isset($b['observedAt']) && $t<$b['observedAt']+15) $dt = min($dt,$b['observedAt']+15-$t);
            $s = self::snapshot($b,$t+$dt/2,$world,$timezone,$dt);
            $stored = $s['stored']+($s['charge']-$s['discharge'])*$dt/3600;
            $b['chargedKwh'] += $s['charge']*$dt/3600;
            $b['dischargedKwh'] += $s['discharge']*$dt/3600;
            $cycles = $s['discharge']*$dt/3600/12;
            $b['cycles'] += $cycles;
            $b['health'] = self::clamp($b['health']-$cycles*.0025-$dt*.5/(365*86400),60,100);
            $b['soc'] = self::clamp($stored/(12*$b['health']/100)*100,10,100);
            $equilibrium = $s['weather']['ambientTemp']+$s['batteryLosses']*18;
            $b['temperature'] += ($equilibrium-$b['temperature'])*(1-exp(-$dt/180));
            $t += $dt;
            if ($t>$now-86400) {
                $last = end($b['socHistory']);
                if (!$last || $t-$last['t']>=30) $b['socHistory'][] = ['t'=>$t,'soc'=>$b['soc']];
                $last = end($b['generationHistory']);
                if (!$last || $t-$last['t']>=30) $b['generationHistory'][] = ['t'=>$t,'pv'=>$b['powered'] ? $s['pv'] : 0];
            }
        }
        $b['simulatedAt'] = $now; $b['updatedAt'] = $now;
        $b['writer'] = ''; $b['writerUntil'] = 0;
        $b['snapshot'] = self::snapshot($b,$now,$world,$timezone);
        return $b;
    }
}
