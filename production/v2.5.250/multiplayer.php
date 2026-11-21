<?php
/** Same-origin discovery/signaling. Audio and 20 Hz poses travel over WebRTC. */
if (!defined('ABSPATH')) { exit; }
require_once __DIR__.'/voice-relay.php';

function bargheto_city_is_admin() {
    $token = $_COOKIE['bc_city_admin'] ?? '';
    return is_string($token) && preg_match('/^[a-f0-9]{64}$/D', $token) && get_transient('bc_admin_' . hash('sha256', $token)) === 'city-admin-v3';
}
function bargheto_city_mp_guard() {
    nocache_headers();
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') { wp_send_json_error(array('message'=>'روش درخواست معتبر نیست.'),405); }
    // Custom header prevents cross-site form posts; no cross-origin CORS is enabled.
    if (($_SERVER['HTTP_X_BARGHETO_REQUEST'] ?? '') !== 'city') { wp_send_json_error(array('message'=>'درخواست معتبر نیست.'),403); }
}
function bargheto_city_admin_session() {
    bargheto_city_mp_guard();
    $op = $_POST['op'] ?? 'status';
    if ($op === 'login') {
        $key = 'bc_login_' . hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'local');
        $tries = (int)get_transient($key);
        if ($tries >= 30) { wp_send_json_error(array('message'=>'چند دقیقه دیگر دوباره امتحان کنید.'),429); }
        // Public-source security hardening: never ship a fixed administrator password.
        // Configure a password_hash() value as BARGHETO_CITY_ADMIN_PASSWORD_HASH in wp-config.php.
        // A signed-in WordPress administrator may also use the city admin interface.
        $configured_hash = defined('BARGHETO_CITY_ADMIN_PASSWORD_HASH')
            ? constant('BARGHETO_CITY_ADMIN_PASSWORD_HASH') : '';
        $provided_password = $_POST['password'] ?? null;
        $authorized_wp_admin = is_user_logged_in() && current_user_can('manage_options');
        $authorized_password = is_string($configured_hash) && $configured_hash !== ''
            && is_string($provided_password)
            && password_verify(wp_unslash($provided_password), $configured_hash);
        if (!$authorized_wp_admin && !$authorized_password) {
            set_transient($key,$tries+1,300);
            wp_send_json_error(array('message'=>'رمز ادمین درست نیست یا ورود مدیر پیکربندی نشده است.'),403);
        }
        $old = $_COOKIE['bc_city_admin'] ?? '';
        if (is_string($old)) { delete_transient('bc_admin_' . hash('sha256',$old)); }
        $token = bin2hex(random_bytes(32));
        set_transient('bc_admin_' . hash('sha256',$token),'city-admin-v3',8*HOUR_IN_SECONDS);
        setcookie('bc_city_admin',$token,array('path'=>'/','secure'=>is_ssl(),'httponly'=>true,'samesite'=>'Lax'));
        $_COOKIE['bc_city_admin']=$token; delete_transient($key);
    } elseif ($op === 'logout') {
        $token = $_COOKIE['bc_city_admin'] ?? '';
        if (is_string($token)) { delete_transient('bc_admin_' . hash('sha256',$token)); }
        setcookie('bc_city_admin','',array('expires'=>time()-3600,'path'=>'/','secure'=>is_ssl(),'httponly'=>true,'samesite'=>'Lax'));
        unset($_COOKIE['bc_city_admin']);
    }
    wp_send_json_success(array('admin'=>bargheto_city_is_admin()));
}
add_action('wp_ajax_bargheto_city_admin_session','bargheto_city_admin_session');
add_action('wp_ajax_nopriv_bargheto_city_admin_session','bargheto_city_admin_session');

function bargheto_city_mp_schema() {
    if (get_option('bargheto_city_mp_schema') === '114') { return; }
    global $wpdb;
    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    $collate=$wpdb->get_charset_collate();
    dbDelta("CREATE TABLE {$wpdb->prefix}bc_city_peers (
        id varchar(32) NOT NULL,
        token char(64) NOT NULL,
        room varchar(32) NOT NULL,
        name varchar(80) NOT NULL,
        role varchar(8) NOT NULL,
        state text NOT NULL,
        identity_hash char(64) NOT NULL DEFAULT '',
        updated bigint NOT NULL,
        PRIMARY KEY  (id),
        KEY room_updated (room,updated),
        KEY identity_hash (identity_hash)
    ) $collate;");
    dbDelta("CREATE TABLE {$wpdb->prefix}bc_city_signals (
        id bigint unsigned NOT NULL AUTO_INCREMENT,
        room varchar(32) NOT NULL,
        sender varchar(32) NOT NULL,
        receiver varchar(32) NOT NULL,
        message_id varchar(50) NOT NULL,
        payload mediumtext NOT NULL,
        created bigint NOT NULL,
        PRIMARY KEY  (id),
        UNIQUE KEY dedup (sender,message_id),
        KEY receiver_id (receiver,id),
        KEY created (created)
    ) $collate;");
    bargheto_city_moderation_schema109();
    bargheto_city_voice_schema114();
    if ($wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s',$wpdb->esc_like($wpdb->prefix.'bc_city_peers'))) && $wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s',$wpdb->esc_like($wpdb->prefix.'bc_city_signals'))) && $wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s',$wpdb->esc_like($wpdb->prefix.'bc_city_voice')))) {
        update_option('bargheto_city_mp_schema','114',false);
    } else { wp_send_json_error(array('message'=>'ساخت جدول ارتباط چندنفره انجام نشد.'),503); }
}
function bargheto_city_mp_state($raw) {
    if (!is_string($raw) || strlen($raw)>2048) { return null; }
    $s=json_decode(wp_unslash($raw),true);
    if (!is_array($s) || !isset($s['p']) || !is_array($s['p']) || array_keys($s['p'])!==array(0,1,2)) { return null; }
    foreach ($s['p'] as $n) { if ((!is_int($n)&&!is_float($n)) || !is_finite((float)$n) || abs($n)>3000) { return null; } }
    foreach (array('yaw','speed','vy') as $k) { if (!isset($s[$k]) || (!is_int($s[$k])&&!is_float($s[$k])) || !is_finite((float)$s[$k])) { return null; } }
    if (!isset($s['seq'],$s['gait']) || !is_int($s['seq']) || $s['seq']<0 || $s['seq']>9007199254740991 || !is_int($s['gait']) || $s['gait']<0 || $s['gait']>2 || $s['speed']<0 || $s['speed']>100 || abs($s['vy'])>100) { return null; }
    foreach (array('grounded','flying','active','muted') as $k) { if (!isset($s[$k]) || !is_bool($s[$k])) { return null; } }
    if (isset($s['space'])&&!in_array($s['space'],array('city','office'),true)) { return null; }
    $s['space']=$s['space']??'city';
    if (isset($s['immersive']) && !is_bool($s['immersive'])) { return null; }
    if (isset($s['stamp'])&&(!is_numeric($s['stamp'])||!is_finite((float)$s['stamp'])||$s['stamp']<0||$s['stamp']>9007199254740991)) { return null; }
    return array_intersect_key($s,array_flip(array('space','stamp','immersive','p','yaw','speed','vy','seq','gait','grounded','flying','active','muted')));
}
function bargheto_city_mp_ice($id) {
    $ice=array(array('urls'=>array('stun:stun.l.google.com:19302','stun:stun.cloudflare.com:3478')));
    $turn=bargheto_city_portable_turn();
    if (!empty($turn['urls']) && !empty($turn['secret'])) {
        $username=(time()+12*HOUR_IN_SECONDS).':'.$id;
        $ice[]=array('urls'=>array_values(array_filter(array_map('trim',explode(',',$turn['urls'])))),'username'=>$username,'credential'=>base64_encode(hash_hmac('sha1',$username,$turn['secret'],true)));
    }
    return apply_filters('bargheto_city_ice_servers',$ice);
}
function bargheto_city_mp() {
    global $wpdb;
    bargheto_city_mp_guard(); bargheto_city_mp_schema();
    $peers=$wpdb->prefix.'bc_city_peers'; $signals=$wpdb->prefix.'bc_city_signals'; $now=time();
    $identity=bargheto_city_identity109();bargheto_city_enforce109($identity);
    $op=$_POST['op']??'poll';
    if(!is_string($op)||!in_array($op,array('join','poll','leave','bess'),true)){wp_send_json_error(array('message'=>'عملیات معتبر نیست.'),400);}
    if ($op==='join') {
        $seed=$_POST['seed']??'';
        if (!is_string($seed) || !preg_match('/^[1-9][0-9]{0,9}$/D',$seed) || (float)$seed>2147483647) { wp_send_json_error(array('message'=>'نقشه معتبر نیست.'),400); }
        $room='city-'.$seed;
        $lock='bc_city_capacity114_'.substr(hash('sha256',$wpdb->prefix.(defined('DB_NAME')?DB_NAME:'')),0,24);
        if ((int)$wpdb->get_var($wpdb->prepare('SELECT GET_LOCK(%s, 2)',$lock))!==1) { wp_send_json_error(array('message'=>'اتصال شلوغ است؛ دوباره تلاش می‌شود.'),503); }
        $wpdb->query($wpdb->prepare("DELETE FROM $peers WHERE updated < %d",$now-45));
        // A reconnect replaces only the caller's token-authenticated previous slot.
        $previous_id=$_POST['previousId114']??'';$previous_token=$_POST['previousToken114']??'';
        if(is_string($previous_id)&&is_string($previous_token)&&preg_match('/^[a-f0-9]{24}$/D',$previous_id)&&preg_match('/^[a-f0-9]{64}$/D',$previous_token)){
            $previous=$wpdb->get_row($wpdb->prepare("SELECT id,token FROM $peers WHERE id=%s",$previous_id),ARRAY_A);
            if($previous&&hash_equals($previous['token'],hash('sha256',$previous_token))){$wpdb->delete($peers,array('id'=>$previous_id));}
        }
        $count=$wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $peers"));
        if($count===null){$wpdb->get_var($wpdb->prepare('SELECT RELEASE_LOCK(%s)',$lock));wp_send_json_error(array('message'=>'خواندن اتصال‌ها از پایگاه داده انجام نشد.'),503);}
        if ($count>=10) { $wpdb->get_var($wpdb->prepare('SELECT RELEASE_LOCK(%s)',$lock)); wp_send_json_error(array('message'=>'سرور پر شده؛ لطفاً بعداً امتحان کنید.','code'=>'city_full','capacity'=>10),429); }
        $id=bin2hex(random_bytes(12)); $token=bin2hex(random_bytes(32));
        $name=sanitize_text_field(wp_unslash(is_string($_POST['name']??null)?$_POST['name']:''));
        $name=function_exists('mb_substr')?mb_substr($name,0,40):substr($name,0,80);
        if ($name==='') { $name='مهمان '.substr($id,-4); }
        $ok=$wpdb->insert($peers,array('id'=>$id,'token'=>hash('sha256',$token),'room'=>$room,'name'=>$name,'role'=>bargheto_city_is_admin()?'admin':'guest','state'=>'null','identity_hash'=>$identity,'updated'=>$now));
        $wpdb->get_var($wpdb->prepare('SELECT RELEASE_LOCK(%s)',$lock));
        if (!$ok) { wp_send_json_error(array('message'=>'ثبت اتصال انجام نشد.'),503); }
        $ice=bargheto_city_mp_ice($id);$relay=false;
        foreach($ice as $server){foreach((array)($server['urls']??array()) as $url){if(is_string($url)&&preg_match('/^turns?:[^\s]+$/D',$url)&&!empty($server['username'])&&!empty($server['credential']))$relay=true;}}
        wp_send_json_success(array('id'=>$id,'token'=>$token,'room'=>$room,'iceServers'=>$ice,'relayConfigured'=>$relay,'voiceRadius'=>20,'capacity'=>10));
    }
    $id=$_POST['id']??''; $token=$_POST['token']??'';
    if (!is_string($id)||!is_string($token)||!preg_match('/^[a-f0-9]{24}$/D',$id)||!preg_match('/^[a-f0-9]{64}$/D',$token)) { wp_send_json_error(array('message'=>'اتصال معتبر نیست.'),403); }
    $me=$wpdb->get_row($wpdb->prepare("SELECT * FROM $peers WHERE id=%s",$id),ARRAY_A);
    if (!$me || (int)$me['updated']<$now-45 || !hash_equals($me['token'],hash('sha256',$token))) { wp_send_json_error(array('message'=>'اتصال منقضی شد؛ اتصال مجدد…'),403); }
    if(!empty($me['identity_hash']))bargheto_city_enforce109($me['identity_hash']);
    if ($op==='bess') { require_once __DIR__.'/solar-bess.php'; $result=bargheto_city_bess_request($me['room'],$_POST['payload']??''); if(is_wp_error($result))wp_send_json_error(array('message'=>$result->get_error_message()),$result->get_error_data()['status']??400); wp_send_json_success($result); }
    if ($op==='leave') { $wpdb->delete($peers,array('id'=>$id)); $wpdb->delete($wpdb->prefix.'bc_city_voice',array('sender'=>$id)); $wpdb->delete($signals,array('receiver'=>$id)); wp_send_json_success(array()); }
    $state=bargheto_city_mp_state($_POST['state']??'');
    if ($state===null) { wp_send_json_error(array('message'=>'وضعیت بازیکن معتبر نیست.'),400); }
    if (!bargheto_city_is_admin()) { $state['flying']=false; }
    $updated=$wpdb->update($peers,array('state'=>wp_json_encode($state),'updated'=>$now,'role'=>bargheto_city_is_admin()?'admin':'guest'),array('id'=>$id));
    if($updated===false){wp_send_json_error(array('message'=>'ثبت وضعیت اتصال انجام نشد.'),503);}
    $raw=$_POST['messages']??'[]';
    if (!is_string($raw)||strlen($raw)>200000) { wp_send_json_error(array('message'=>'پیام بیش از حد بزرگ است.'),413); }
    $out=json_decode(wp_unslash($raw),true);
    if (!is_array($out)||count($out)>64) { wp_send_json_error(array('message'=>'پیام معتبر نیست.'),400); }
    $others=$wpdb->get_results($wpdb->prepare("SELECT id,name,role,state FROM $peers WHERE room=%s AND updated>=%d AND id<>%s",$me['room'],$now-45,$id),ARRAY_A);
    if(!is_array($others)){wp_send_json_error(array('message'=>'خواندن افراد حاضر انجام نشد.'),503);}
    $others=array_values(array_filter($others,function($peer)use($state){$pose=json_decode($peer['state'],true);return is_array($pose)&&($pose['space']??'city')===$state['space'];}));
    $voice114=bargheto_city_voice_exchange114($me,$others,$state);
    $allowed=array_column($others,'id');
    foreach ($out as $m) {
        if (!is_array($m)||!is_string($m['id']??null)||!preg_match('/^[a-zA-Z0-9-]{1,50}$/D',$m['id'])||!in_array($m['to']??null,$allowed,true)||!is_array($m['data']??null)) { continue; }
        if(($m['data']['space119']??'city')!==$state['space'])continue;
        $payload=wp_json_encode($m['data']);
        if (strlen($payload)>50000 || (!isset($m['data']['description'])&&!isset($m['data']['candidate']))) { continue; }
        $ok=$wpdb->query($wpdb->prepare("INSERT IGNORE INTO $signals (room,sender,receiver,message_id,payload,created) VALUES (%s,%s,%s,%s,%s,%d)",$me['room'],$id,$m['to'],$m['id'],$payload,$now));
        if ($ok===false) { wp_send_json_error(array('message'=>'ارسال پیام ارتباط انجام نشد.'),503); }
    }
    $cursor=$_POST['cursor']??'0';
    if(!is_string($cursor)||!preg_match('/^[0-9]{1,19}$/D',$cursor)){wp_send_json_error(array('message'=>'شناسه پیام معتبر نیست.'),400);}
    $cursor=(int)$cursor;
    $incoming=$wpdb->get_results($wpdb->prepare("SELECT id,sender,payload FROM $signals WHERE receiver=%s AND room=%s AND id>%d ORDER BY id ASC LIMIT 256",$id,$me['room'],$cursor),ARRAY_A);
    if(!is_array($incoming)){wp_send_json_error(array('message'=>'خواندن پیام‌های ارتباط انجام نشد.'),503);}
    foreach ($others as &$p) { $p['state']=json_decode($p['state'],true); } unset($p);
    foreach ($incoming as &$m) { $m['data']=json_decode($m['payload'],true); unset($m['payload']); $m['id']=(int)$m['id']; } unset($m);
    $wpdb->query($wpdb->prepare("DELETE FROM $signals WHERE created<%d",$now-120));
    wp_send_json_success(array('peers'=>$others,'messages'=>$incoming,'admin'=>bargheto_city_is_admin(),'voice114'=>$voice114));
}
add_action('wp_ajax_bargheto_city_mp','bargheto_city_mp');
add_action('wp_ajax_nopriv_bargheto_city_mp','bargheto_city_mp');
