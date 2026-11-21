<?php
/** Authenticated, room-scoped persistence for the imported Island2 educational battery. */
if (!defined('ABSPATH')) exit;
require_once __DIR__.'/bess-engine.php';
function bargheto_city_bess_default() {
 return ['initialized'=>true,'powered'=>true,'tracking'=>true,'loadKw'=>.5,'soc'=>62.0,'health'=>98.0,'cycles'=>248.0,'temperature'=>26.0,'chargedKwh'=>0.0,'dischargedKwh'=>0.0,'revision'=>0,'writer'=>'','writerUntil'=>0,'updatedAt'=>0,'socHistory'=>[],'generationHistory'=>[]];
}
function bargheto_city_bess_controls($patch) {
 if(!is_array($patch)||!$patch||count($patch)>3||array_diff(array_keys($patch),['powered','tracking','loadKw']))return new WP_Error('BESS_CONTROLS','تنظیمات باتری نامعتبر است.',['status'=>400]);
 foreach($patch as $k=>$v){if($k==='loadKw'){if(!is_numeric($v)||!is_finite((float)$v)||$v<0||$v>2)return new WP_Error('BESS_LOAD','مصرف باید بین صفر و دو کیلووات باشد.',['status'=>400]);$patch[$k]=(float)$v;}elseif(!is_bool($v))return new WP_Error('BESS_SWITCH','وضعیت کلید نامعتبر است.',['status'=>400]);}
 return $patch;
}
function bargheto_city_bess_request($room,$raw) {
 global $wpdb;
 if(!is_string($raw)||strlen($raw)>4096)return new WP_Error('BESS_DATA','درخواست باتری نامعتبر است.',['status'=>400]);
 $p=json_decode(wp_unslash($raw),true);$kind=is_array($p)?($p['kind']??''):'';
 if(!in_array($kind,['state','bootstrap','controls','telemetry'],true))return new WP_Error('BESS_KIND','نوع درخواست نامعتبر است.',['status'=>400]);
 $patch=$kind==='controls'?bargheto_city_bess_controls($p['controls']??null):[];
 if(is_wp_error($patch))return $patch;
 $key='bargheto_city_bess_'.hash('sha256',$room);$lock='bc_bess_'.md5($room);
 if((int)$wpdb->get_var($wpdb->prepare('SELECT GET_LOCK(%s, 2)',$lock))!==1)return new WP_Error('BESS_BUSY','سرور باتری مشغول است.',['status'=>503]);
 try{
  // Ignore client SOC/health/telemetry: the server owns energy and histories.
  // Flush option caches after acquiring the cross-request database lock.
  wp_cache_delete($key,'options');wp_cache_delete('notoptions','options');
  $saved=get_option($key,null);$state=array_merge(bargheto_city_bess_default(),is_array($saved)?$saved:[]);
  $now=microtime(true);$world=['mode'=>'day'];$tz=new DateTimeZone('UTC');
  $state=Bargheto_City_Bess_Engine::advance($state,$now,$world,$tz);
  if($patch){foreach($patch as $k=>$v)$state[$k]=$v;$state['revision']++;$state=Bargheto_City_Bess_Engine::advance($state,$now,$world,$tz);}
  if(!update_option($key,$state,false)&&get_option($key,null)!=$state)return new WP_Error('BESS_SAVE','ذخیرهٔ وضعیت باتری انجام نشد.',['status'=>500]);
  return ['state'=>$state,'writerAccepted'=>false];
 }finally{$wpdb->get_var($wpdb->prepare('SELECT RELEASE_LOCK(%s)',$lock));}
}
