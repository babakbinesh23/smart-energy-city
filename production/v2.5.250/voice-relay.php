<?php
/** Short-lived HTTPS audio fallback; no external relay service or credentials required. */
if (!defined('ABSPATH')) { exit; }
function bargheto_city_voice_schema114() {
    global $wpdb;
    $collate=$wpdb->get_charset_collate();
    dbDelta("CREATE TABLE {$wpdb->prefix}bc_city_voice (
        id bigint unsigned NOT NULL AUTO_INCREMENT,
        room varchar(32) NOT NULL,
        sender varchar(24) NOT NULL,
        sequence_no bigint unsigned NOT NULL,
        mime varchar(80) NOT NULL,
        payload mediumtext NOT NULL,
        created bigint unsigned NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY dedup (sender,sequence_no),
        KEY room_created (room,created),
        KEY sender_created (sender,created)
    ) $collate;");
}
function bargheto_city_voice_near114($a,$b) {
    if (empty($a['active'])||empty($b['active'])||!isset($a['p'],$b['p'])||count($a['p'])!==3||count($b['p'])!==3) { return false; }
    if(($a['space']??'city')!==($b['space']??'city'))return false;
    $distance=0;foreach(array(0,1,2) as $i)$distance+=pow($a['p'][$i]-$b['p'][$i],2);
    return $distance<400;
}
function bargheto_city_voice_exchange114($me,$others,$state) {
    global $wpdb;
    $voiceRoom=$me['room'].':'.($state['space']??'city');
    $table=$wpdb->prefix.'bc_city_voice';$now=(int)floor(microtime(true)*1000);
    $raw=$_POST['voice114']??'[]';$cursor=$_POST['voiceCursor114']??'0';$want=$_POST['voiceWant114']??'[]';
    if(!is_string($raw)||strlen($raw)>100000||!is_string($cursor)||!preg_match('/^[0-9]{1,19}$/D',$cursor)||!is_string($want)||strlen($want)>1000) { wp_send_json_error(array('message'=>'بسته صوتی معتبر نیست.'),400); }
    $packets=json_decode(wp_unslash($raw),true);$wanted=json_decode(wp_unslash($want),true);
    if(!is_array($packets)||count($packets)>2||!is_array($wanted)||count($wanted)>9) { wp_send_json_error(array('message'=>'بسته صوتی بیش از حد بزرگ است.'),400); }
    $allowed=array();foreach($others as $peer){$pose=is_string($peer['state'])?json_decode($peer['state'],true):$peer['state'];if(is_array($pose)&&bargheto_city_voice_near114($state,$pose)&&in_array($peer['id'],$wanted,true))$allowed[]=$peer['id'];}
    $types=array('audio/webm;codecs=opus','audio/ogg;codecs=opus','audio/webm','audio/ogg','audio/mp4','audio/mp4;codecs=mp4a.40.2');
    $count=null;
    foreach($packets as $packet){
        if(empty($state['active'])||!empty($state['muted']))break;
        if(!is_array($packet)||!is_int($packet['seq']??null)||$packet['seq']<1||$packet['seq']>9007199254740991||!in_array($packet['mime']??null,$types,true)||!is_string($packet['data']??null)||strlen($packet['data'])>44000)continue;
        $decoded=base64_decode($packet['data'],true);if($decoded===false||strlen($decoded)<32||strlen($decoded)>32768)continue;
        $webm=substr($decoded,0,4)==="\x1a\x45\xdf\xa3";$ogg=substr($decoded,0,4)==='OggS';$mp4=substr($decoded,4,4)==='ftyp';if(!$webm&&!$ogg&&!$mp4)continue;
        if($count===null)$count=(int)$wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $table WHERE sender=%s AND created>%d",$me['id'],$now-1000));
        if($count++>=5)continue;
        $result=$wpdb->query($wpdb->prepare("INSERT IGNORE INTO $table (room,sender,sequence_no,mime,payload,created) VALUES (%s,%s,%d,%s,%s,%d)",$voiceRoom,$me['id'],$packet['seq'],$packet['mime'],$packet['data'],$now));
        if($result===false)wp_send_json_error(array('message'=>'ارسال صدای پشتیبان انجام نشد.'),503);
    }
    $latest=(string)($wpdb->get_var($wpdb->prepare("SELECT MAX(id) FROM $table WHERE room=%s",$voiceRoom))??'0');$rows=array();
    if(($cursor!=='0'||($_POST['voiceInit114']??'')==='1')&&$allowed){
        $in=implode(',',array_fill(0,count($allowed),'%s'));
        $args=array_merge(array($voiceRoom,(int)$cursor,$now-3000),$allowed);
        $rows=$wpdb->get_results($wpdb->prepare("SELECT id,sender,mime,payload,created FROM $table WHERE room=%s AND id>%d AND created>%d AND sender IN ($in) ORDER BY id ASC LIMIT 30",...$args),ARRAY_A);
        if(!is_array($rows))wp_send_json_error(array('message'=>'دریافت صدای پشتیبان انجام نشد.'),503);
    }
    $wpdb->query($wpdb->prepare("DELETE FROM $table WHERE created<%d",$now-8000));
    return array('cursor'=>$latest,'packets'=>array_map(function($row){return array('id'=>(string)$row['id'],'sender'=>$row['sender'],'mime'=>$row['mime'],'data'=>$row['payload']);},$rows));
}
