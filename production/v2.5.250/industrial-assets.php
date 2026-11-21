<?php
/** Public, allowlisted bundled models. PHP serves them even on hosts without a GLB MIME mapping. */
if (!defined('ABSPATH')) { exit; }
function bargheto_city_vehicle_names() {
    return array( 'bargheto-expert', 'jungheinrich_forklift', 'forklift', 'truck', 'construction_truck', 'a_chinese_worker', 'worker-apl-driver', 'male-avatar');
}
function bargheto_city_vehicle_urls() {
    $urls = array();
    foreach (bargheto_city_vehicle_names() as $name) {
        $urls[$name] = add_query_arg(array('action'=>'bargheto_city_vehicle','model'=>$name,'v'=>in_array($name, array('bargheto-office-vr','office-eric'), true) ? '2.5.70' : ($name === 'bargheto-expert' ? '2.5.50' : ($name === 'male-avatar' ? '2.5.42' : ($name === 'worker-apl-driver' ? '2.5.44' : '2.5.31')))), admin_url('admin-ajax.php', 'relative'));
    }
    return $urls;
}
/** Public bundled models can bypass a full WordPress bootstrap per download.
 * Keep the allowlisted AJAX endpoints as a fallback for restrictive hosts.
 */
function bargheto_city_vehicle_downloads83() {
    $urls = bargheto_city_vehicle_urls();
    $fallbacks = array();
    $external=bargheto_city_server_urls109();
    foreach($urls as $name=>$fallback){foreach($external as $filename=>$url){if(preg_match('/^'.preg_quote($name,'/').'-[^\/]+\.glb$/D',$filename)){$urls[$name]=$url;$fallbacks[$url]=$fallback;break;}}}
    foreach ($urls as $name => $fallback) {
        $files = glob(__DIR__ . '/game/dist/assets/' . $name . '-*.glb');
        if ($files && count($files) === 1 && is_readable($files[0])) {
            $direct = plugins_url('game/dist/assets/' . basename($files[0]), __FILE__);
            $urls[$name] = $direct;
            $fallbacks[$direct] = $fallback;
        }
    }
    return array('urls' => $urls, 'fallbacks' => $fallbacks);
}
function bargheto_city_vehicle_asset() {
    $name = isset($_GET['model']) && is_string($_GET['model']) ? wp_unslash($_GET['model']) : '';
    if (!in_array($name, bargheto_city_vehicle_names(), true)) { status_header(404); exit; }
    $files = glob(__DIR__ . '/game/dist/assets/' . $name . '-*.glb');
    if (!$files || count($files)!==1) { $loc=bargheto_city_media_location();$files=is_wp_error($loc)?array():glob($loc['path'].'/bundled/'.$name.'-*.glb'); }
    if (!$files || count($files)!==1 || !is_readable($files[0])) { status_header(404); exit; }
    $file = $files[0];
    header('Content-Type: model/gltf-binary');
    header('X-Content-Type-Options: nosniff');
    header('Cache-Control: public, max-age=86400');
    header('Content-Length: ' . filesize($file));
    if (!isset($_SERVER['REQUEST_METHOD']) || $_SERVER['REQUEST_METHOD'] !== 'HEAD') { readfile($file); }
    exit;
}
add_action('wp_ajax_bargheto_city_vehicle', 'bargheto_city_vehicle_asset');
add_action('wp_ajax_nopriv_bargheto_city_vehicle', 'bargheto_city_vehicle_asset');

/** The supplied expert dialogue is public media, served by a fixed allowlist. */
function bargheto_city_expert_voice() {
    foreach(bargheto_city_server_manifest109() as $relative=>$spec){if(strpos($relative,'bundled/expert-dialogue-')===0)return array('url'=>bargheto_city_server_url109($relative),'sha256'=>$spec['sha256']);}
    return array('url'=>add_query_arg(array('action'=>'bargheto_city_expert_audio','v'=>'2.5.51'),admin_url('admin-ajax.php','relative')),'sha256'=>'b90e9a10c9eefcdd30a00630a19afafd08b2d880c70505b74d7ae770fa71fd04');
}
function bargheto_city_expert_audio_asset() {
    $files=glob(__DIR__.'/game/dist/assets/expert-dialogue-*.mp3');
    if(!$files){$loc=bargheto_city_media_location();$files=is_wp_error($loc)?array():glob($loc['path'].'/bundled/expert-dialogue-*.mp3');}
    if (!$files || count($files)!==1 || !is_readable($files[0])) { status_header(404); exit; }
    $size=filesize($files[0]);$start=0;$end=$size-1;$partial=false;
    if(isset($_SERVER['HTTP_RANGE'])) {
        $range=$_SERVER['HTTP_RANGE'];
        if(!is_string($range) || !preg_match('/^bytes=(\d*)-(\d*)$/D',$range,$m) || ($m[1]==='' && $m[2]==='')) { status_header(416);header('Content-Range: bytes */'.$size);exit; }
        if($m[1]==='') { $suffix=(int)$m[2];if($suffix<=0){status_header(416);header('Content-Range: bytes */'.$size);exit;} $start=max(0,$size-$suffix); }
        else { $start=(int)$m[1];if($m[2]!=='')$end=min($end,(int)$m[2]); }
        if($start>=$size || $end<$start) { status_header(416);header('Content-Range: bytes */'.$size);exit; }
        $partial=true;
    }
    $handle=fopen($files[0],'rb');if(!$handle){status_header(404);exit;}
    if($partial){status_header(206);header('Content-Range: bytes '.$start.'-'.$end.'/'.$size);}
    header('Content-Type: audio/mpeg');header('X-Content-Type-Options: nosniff');header('Cache-Control: public, max-age=86400');header('Accept-Ranges: bytes');header('Content-Length: '.($end-$start+1));
    if(isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD']==='HEAD'){fclose($handle);exit;}
    fseek($handle,$start);$remaining=$end-$start+1;
    while($remaining>0 && !feof($handle) && !connection_aborted()){$chunk=fread($handle,min(65536,$remaining));if($chunk===false || $chunk==='')break;echo $chunk;$remaining-=strlen($chunk);}
    fclose($handle);exit;
}
add_action('wp_ajax_bargheto_city_expert_audio','bargheto_city_expert_audio_asset');
add_action('wp_ajax_nopriv_bargheto_city_expert_audio','bargheto_city_expert_audio_asset');
