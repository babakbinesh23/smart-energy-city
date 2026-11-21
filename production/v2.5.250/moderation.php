<?php
/** Server enforced moderation. No identities or live responses enter the public asset cache. */
if (!defined('ABSPATH')) { exit; }
function bargheto_city_identity109() {
    $token=$_COOKIE['bc_city_device109']??'';
    if(!is_string($token)||!preg_match('/^[a-f0-9]{64}$/D',$token)){
        $token=bin2hex(random_bytes(32));
        setcookie('bc_city_device109',$token,array('expires'=>time()+YEAR_IN_SECONDS,'path'=>'/','secure'=>is_ssl(),'httponly'=>true,'samesite'=>'Lax'));
        $_COOKIE['bc_city_device109']=$token;
    }
    return hash_hmac('sha256',$token,wp_salt('auth'));
}
function bargheto_city_moderation_schema109() {
    global $wpdb;
    dbDelta("CREATE TABLE {$wpdb->prefix}bc_city_restrictions (
        subject char(64) NOT NULL,
        name varchar(80) NOT NULL,
        kind varchar(8) NOT NULL,
        expires bigint NOT NULL,
        created bigint NOT NULL,
        PRIMARY KEY  (subject),
        KEY expires (expires)
    ) {$wpdb->get_charset_collate()};");
    if(!$wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s',$wpdb->esc_like($wpdb->prefix.'bc_city_restrictions'))))wp_send_json_error(array('message'=>'جدول مدیریت کاربران ساخته نشد.'),503);
}
function bargheto_city_restriction109($subject) {
    global $wpdb;
    return $wpdb->get_row($wpdb->prepare("SELECT kind,expires FROM {$wpdb->prefix}bc_city_restrictions WHERE subject=%s AND (expires=0 OR expires>%d)",$subject,time()),ARRAY_A);
}
function bargheto_city_enforce109($subject) {
    $r=bargheto_city_restriction109($subject);if(!$r)return;
    wp_send_json_error(array('code'=>$r['kind']==='ban'?'city_banned':'city_kicked','message'=>$r['kind']==='ban'?'دسترسی این مرورگر به بازی توسط ادمین مسدود شده است.':'توسط ادمین از بازی خارج شدید؛ یک دقیقه بعد می‌توانید دوباره وارد شوید.','until'=>(int)$r['expires']),403);
}
function bargheto_city_moderation109() {
    global $wpdb;
    bargheto_city_mp_guard();
    if(!bargheto_city_is_admin())wp_send_json_error(array('message'=>'فقط ادمین بازی به این بخش دسترسی دارد.'),403);
    bargheto_city_mp_schema();$table=$wpdb->prefix.'bc_city_peers';$rules=$wpdb->prefix.'bc_city_restrictions';$now=time();$op=$_POST['op']??'list';
    if(!is_string($op)||!in_array($op,array('list','kick','ban','unban'),true))wp_send_json_error(array('message'=>'عملیات معتبر نیست.'),400);
    if($op==='unban'){
        $subject=$_POST['subject']??'';if(!is_string($subject)||!preg_match('/^[a-f0-9]{64}$/D',$subject))wp_send_json_error(array('message'=>'شناسه بن معتبر نیست.'),400);
        if($wpdb->delete($rules,array('subject'=>$subject))===false)wp_send_json_error(array('message'=>'رفع بن انجام نشد.'),503);
    }elseif($op==='kick'||$op==='ban'){
        $id=$_POST['target']??'';if(!is_string($id)||!preg_match('/^[a-f0-9]{24}$/D',$id))wp_send_json_error(array('message'=>'شناسه کاربر معتبر نیست.'),400);
        $peer=$wpdb->get_row($wpdb->prepare("SELECT id,name,role,identity_hash FROM $table WHERE id=%s AND updated>=%d",$id,$now-45),ARRAY_A);
        if(!$peer)wp_send_json_error(array('message'=>'این کاربر دیگر آنلاین نیست.'),404);
        if($peer['role']==='admin'||$peer['identity_hash']===bargheto_city_identity109())wp_send_json_error(array('message'=>'کیک یا بن ادمین و مرورگر خودتان مجاز نیست.'),403);
        if(!preg_match('/^[a-f0-9]{64}$/D',$peer['identity_hash']))wp_send_json_error(array('message'=>'این اتصال قدیمی است؛ کاربر باید صفحه را تازه کند.'),409);
        if($wpdb->replace($rules,array('subject'=>$peer['identity_hash'],'name'=>$peer['name'],'kind'=>$op,'expires'=>$op==='ban'?0:$now+60,'created'=>$now))===false)wp_send_json_error(array('message'=>'ثبت محدودیت انجام نشد.'),503);
        $ids=$wpdb->get_col($wpdb->prepare("SELECT id FROM $table WHERE identity_hash=%s",$peer['identity_hash']));
        if($wpdb->delete($table,array('identity_hash'=>$peer['identity_hash']))===false)wp_send_json_error(array('message'=>'قطع اتصال انجام نشد.'),503);
        foreach($ids as $removed){$wpdb->delete($wpdb->prefix.'bc_city_signals',array('sender'=>$removed));$wpdb->delete($wpdb->prefix.'bc_city_signals',array('receiver'=>$removed));}
    }
    $wpdb->query($wpdb->prepare("DELETE FROM $rules WHERE expires>0 AND expires<=%d",$now));
    $players=$wpdb->get_results($wpdb->prepare("SELECT id,name,role,room,updated FROM $table WHERE updated>=%d ORDER BY room,name",$now-45),ARRAY_A);
    $bans=$wpdb->get_results("SELECT subject,name,created FROM $rules WHERE kind='ban' ORDER BY created DESC LIMIT 200",ARRAY_A);
    if(!is_array($players)||!is_array($bans))wp_send_json_error(array('message'=>'خواندن فهرست کاربران انجام نشد.'),503);
    wp_send_json_success(array('players'=>$players,'count'=>count($players),'bans'=>$bans,'ttl'=>45,'serverTime'=>$now));
}
add_action('wp_ajax_bargheto_city_moderation109','bargheto_city_moderation109');add_action('wp_ajax_nopriv_bargheto_city_moderation109','bargheto_city_moderation109');
/** Public document gate also covers a reload after a kick or ban. */
function bargheto_city_document_gate109() {
    bargheto_city_mp_schema();$r=bargheto_city_restriction109(bargheto_city_identity109());
    if(!$r||bargheto_city_is_admin())return;
    status_header(403);nocache_headers();header('Content-Type: text/html; charset=UTF-8');
    $text=$r['kind']==='ban'?'دسترسی شما به بازی توسط ادمین مسدود شده است.':'توسط ادمین از بازی خارج شدید؛ یک دقیقه بعد دوباره تلاش کنید.';
    echo '<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>دسترسی به شهر برقتو</title><body style="background:#101827;color:#fff;font:16px/2 Tahoma;padding:10vh 8vw"><h1>شهر برقتو</h1><p>'.esc_html($text).'</p><a style="color:#9ce6c0" href="'.esc_url(home_url('/barghetocity/')).'">بررسی دوبارهٔ دسترسی</a></body></html>';exit;
}
