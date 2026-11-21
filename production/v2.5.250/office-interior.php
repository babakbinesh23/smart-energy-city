<?php
/** The supplied office source is preserved verbatim. Server owns edit permission. */
if (!defined('ABSPATH')) { exit; }
function bargheto_city_office97_serve() {
    $vr128=isset($_GET['city-xr'])&&$_GET['city-xr']==='1';
    nocache_headers();$source=__DIR__.'/office/shell-v22.html';
    if (!is_readable($source)) { status_header(503);exit('فایل دفتر در دسترس نیست.'); }
    $admin=bargheto_city_is_admin();$base=trailingslashit(wp_make_link_relative(plugins_url('office',__FILE__)));
    $cfg=array('mediaBase'=>bargheto_city_server_base109(),'canEdit'=>$admin,'nonce'=>$admin?wp_create_nonce('bargheto_city_office97'):null,'endpoint'=>admin_url('admin-ajax.php','relative'),'cityUrl'=>home_url('/barghetocity/'),'assetBase'=>$base,'sourceUrl'=>$base.'source-v22.html','joystickUrl'=>wp_make_link_relative(plugins_url('game/dist/assets/joystick-'.($vr128?'2.5.168':'2.5.182').'.js',__FILE__)),'sourceSHA'=>'31cb1415ca7ea64614fced5abc7a0cc5308fdb7f5247a7ad082d3a88878d69d8','saved'=>get_option('bargheto_city_office97_layout',null));
    $boot='<script>window.OfficeHost97='.wp_json_encode($cfg,JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT|JSON_UNESCAPED_SLASHES).';if(parent!==window&&new URLSearchParams(location.search).has("city-host"))document.documentElement.setAttribute("data-office99-embedded","");</script>';
    $boot.='<script>window.barghetoCityServerMedia109='.wp_json_encode(bargheto_city_server_urls109(),JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT).';</script><script src="'.esc_url($base.'../game/dist/assets/media-urls-2.5.223.js').'"></script>';
    foreach(array('loading') as $script){$boot.='<script src="'.esc_url($base.$script.'-2.5.99.js').'"></script>';}
    $boot.='<script src="'.esc_url($base.'cache-2.5.113.js').'"></script>';
    foreach(array('patches','autosave','bridge') as $script){$boot.='<script src="'.esc_url($base.$script.($script==='autosave'?'-2.5.113.js':($script==='patches'?($vr128?'-vr-2.5.181.js':'-2.5.184.js'):($vr128?'-vr-2.5.243.js':'-2.5.241.js')))).'"></script>';}
    $boot.='<script src="'.esc_url($base.'interaction-patches-2.5.127.js').'"></script>';
    $boot.='<script src="'.esc_url($base.'water-patches-2.5.235.js').'"></script>';
    $boot.='<script src="'.esc_url($base.'devices-patches-2.5.235.js').'"></script>';
    $boot.='<script src="'.esc_url($base.'ghost-2.5.224.js').'"></script>';
    $boot.='<script src="'.esc_url($base.'mobile-walk-patches-2.5.244.js').'"></script>';
    $boot.='<script src="'.esc_url($base.'../game/dist/assets/clean-view-2.5.235.js').'"></script>';
    if($vr128)$boot.='<script src="'.esc_url($base.'model-load-patches-2.5.241.js').'"></script>';
    if($vr128)$boot.='<script src="'.esc_url($base.'entry-2.5.138.js').'"></script>';
    $boot.='<script defer src="'.esc_url($base.($vr128?'loader-vr-2.5.243.js':'loader-2.5.157.js')).'"></script>';
    header('Content-Type: text/html; charset=UTF-8');header('Permissions-Policy: xr-spatial-tracking=(self), fullscreen=(self), autoplay=(self)');header('X-Frame-Options: SAMEORIGIN');
    echo str_replace('<!--OFFICE99_BOOT-->',$boot,file_get_contents($source));exit;
}
add_action('wp_ajax_bargheto_city_office97','bargheto_city_office97_serve');add_action('wp_ajax_nopriv_bargheto_city_office97','bargheto_city_office97_serve');
function bargheto_city_office97_numbers($value,$count,$limit=1000) {
    if (!is_array($value)||count($value)!==$count||array_keys($value)!==range(0,$count-1)) { return false; }
    foreach ($value as $n) { if ((!is_int($n)&&!is_float($n))||!is_finite((float)$n)||abs($n)>$limit) { return false; } }return true;
}
function bargheto_city_office97_validate($data) {
    if (!is_array($data)||($data['schema']??null)!==1||!is_array($data['items']??null)||count($data['items'])>600||!is_array($data['colliders']??null)||count($data['colliders'])>1000||!is_array($data['lights']??null)||count($data['lights'])>200) { return null; }
    $manifest=json_decode(file_get_contents(__DIR__.'/office/manifest-v22.json'),true);$ids=array();$items=array();
    foreach ($data['items'] as $item) {
        if (!is_array($item)||!is_string($item['id']??null)||strlen($item['id'])>180||!is_string($item['asset']??null)) { return null; }
        $id=$item['id'];$base=preg_replace('/(?:-copy-[0-9]+)+$/D','',$id);
        if (!isset($manifest[$base])||$manifest[$base]!==$item['asset']||isset($ids[$id])) { return null; }
        if (!bargheto_city_office97_numbers($item['position']??null,3,100)||!bargheto_city_office97_numbers($item['rotation']??null,3,100)||!bargheto_city_office97_numbers($item['scale']??null,3,100)||!is_bool($item['deleted']??null)) { return null; }
        foreach ($item['scale'] as $s) { if (abs($s)<.000001) { return null; } }
        $q=$item['quaternion']??null;if ($q!==null&&(!bargheto_city_office97_numbers($q,4,2)||array_sum(array_map(function($v){return $v*$v;},$q))<.000001)) { return null; }
        $desk=$item['deskId']??null;if ($desk!==null&&(!is_string($desk)||strlen($desk)>180)) { return null; }
        $ids[$id]=true;$items[]=array('id'=>$id,'asset'=>$item['asset'],'position'=>$item['position'],'rotation'=>$item['rotation'],'quaternion'=>$q,'scale'=>$item['scale'],'deleted'=>$item['deleted'],'deskId'=>$desk);
    }
    foreach ($manifest as $id=>$asset) { if (!isset($ids[$id])) { return null; } }
    foreach ($items as $item) { if ($item['deskId']!==null&&!isset($ids[$item['deskId']])) { return null; } }
    $colliders=array();foreach ($data['colliders'] as $c) {
        if (!is_array($c)||!is_string($c['id']??null)||strlen($c['id'])>200) { return null; }
        $next=array('id'=>$c['id']);foreach (array('x','z','hx','hz','height','minY') as $key) {
            if ($key==='minY'&&!isset($c[$key])) { continue; }
            if (!isset($c[$key])||(!is_int($c[$key])&&!is_float($c[$key]))||!is_finite((float)$c[$key])||abs($c[$key])>200) { return null; }$next[$key]=$c[$key];
        }if ($next['hx']<0||$next['hz']<0) { return null; }$colliders[]=$next;
    }
    $lights=array();foreach ($data['lights'] as $l) {
        if (!is_array($l)||!is_string($l['name']??null)||strlen($l['name'])>200||!bargheto_city_office97_numbers($l['position']??null,3,200)||(!is_int($l['base']??null)&&!is_float($l['base']??null))||!is_finite((float)$l['base'])||$l['base']<0||$l['base']>10000) { return null; }
        $owner=$l['owner']??null;if ($owner!==null&&(!is_string($owner)||!isset($ids[$owner]))) { return null; }$lights[]=array('name'=>$l['name'],'owner'=>$owner,'position'=>$l['position'],'base'=>$l['base']);
    }return array('schema'=>1,'items'=>$items,'colliders'=>$colliders,'lights'=>$lights);
}
function bargheto_city_office97_save() {
    global $wpdb;nocache_headers();
    if (($_SERVER['REQUEST_METHOD']??'')!=='POST') { wp_send_json_error(array('message'=>'روش درخواست معتبر نیست.'),405); }
    if (!bargheto_city_is_admin()||!check_ajax_referer('bargheto_city_office97','nonce',false)) { wp_send_json_error(array('message'=>'برای ذخیرهٔ چیدمان باید با دسترسی ادمین وارد شوید.'),403); }
    $json=$_POST['layout']??null;$revision=$_POST['revision']??null;
    if (!is_string($json)||strlen($json)>1048576||!is_string($revision)||!preg_match('/^[0-9]{1,10}$/D',$revision)) { wp_send_json_error(array('message'=>'اطلاعات ذخیره معتبر نیست.'),400); }
    $layout=bargheto_city_office97_validate(json_decode(wp_unslash($json),true,32));if ($layout===null) { wp_send_json_error(array('message'=>'ساختار چیدمان معتبر نیست؛ ذخیره انجام نشد.'),400); }
    $key='bargheto_city_office97_layout';$old=get_option($key,null);$expected=(int)$revision;
    if ((is_array($old)?(int)$old['revision']:0)!==$expected) { wp_send_json_error(array('message'=>'مدیر دیگری چیدمان را تغییر داده؛ پیش از ادامه صفحه را تازه کنید.'),409); }
    $next=array('revision'=>$expected+1,'layout'=>$layout,'updated_at'=>gmdate('c'));
    if ($old===null) { $saved=add_option($key,$next,'',false); }else { $saved=$wpdb->query($wpdb->prepare("UPDATE {$wpdb->options} SET option_value = %s WHERE option_name = %s AND BINARY option_value = %s",maybe_serialize($next),$key,maybe_serialize($old)))===1; }
    wp_cache_delete($key,'options');if (!$saved) { wp_send_json_error(array('message'=>'ذخیره انجام نشد؛ تغییر هم‌زمان یا خطای پایگاه داده.'),409); }
    wp_send_json_success(array('revision'=>$next['revision'],'nonce'=>wp_create_nonce('bargheto_city_office97')));
}
add_action('wp_ajax_bargheto_city_office97_save','bargheto_city_office97_save');add_action('wp_ajax_nopriv_bargheto_city_office97_save','bargheto_city_office97_save');
