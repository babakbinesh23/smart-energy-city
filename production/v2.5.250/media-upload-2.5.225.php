<?php
/** Small authenticated uploads and one-file-at-a-time media installation. */
if (!defined('ABSPATH')) { exit; }

function bargheto_city_upload_chunk_size225() {
    // Negotiate larger chunks on capable servers while retaining multipart headroom.
    $limit = (int) wp_max_upload_size();
    return max(1024, min(8 * 1024 * 1024, $limit > 0 ? (int) floor($limit / 2) : 256 * 1024));
}

function bargheto_city_media_already_ready229($manifest, $loc) {
    $receipt=get_option('bargheto_city_media_receipt221',array());
    return !get_option('bargheto_city_media_error211','') && !empty($receipt['checked_at'])
        && $receipt['checked_at']>time()-3600
        && ($receipt['fingerprint']??'')===bargheto_city_media_fingerprint221($manifest,$loc);
}

function bargheto_city_upload_save225($dir, $state) {
    $temp = $dir . '/state.new';
    if (file_put_contents($temp, wp_json_encode($state), LOCK_EX) === false) { throw new RuntimeException('ذخیرهٔ وضعیت بارگذاری انجام نشد؛ فضای دیسک را بررسی کنید.'); }
    // Windows cannot always rename over an existing file; the caller holds the session lock.
    if (!@rename($temp, $dir . '/state.json')) {
        if (!@copy($temp, $dir . '/state.json')) { throw new RuntimeException('وضعیت بارگذاری قابل نوشتن نیست.'); }
        @unlink($temp);
    }
}

function bargheto_city_upload_private225($dir) {
    if (!wp_mkdir_p($dir) || is_link($dir)) { throw new RuntimeException('پوشهٔ موقت بارگذاری قابل نوشتن نیست.'); }
    $files = array('index.php'=>"<?php exit;\n", '.htaccess'=>"Require all denied\n",
        'web.config'=>'<?xml version="1.0"?><configuration><system.webServer><security><requestFiltering><hiddenSegments><add segment="payload.zip"/><add segment="state.json"/></hiddenSegments></requestFiltering><authorization><clear/><add accessType="Deny" users="*"/></authorization></security></system.webServer></configuration>');
    foreach ($files as $name=>$text) {
        if (!is_file($dir . '/' . $name) && file_put_contents($dir . '/' . $name, $text, LOCK_EX) === false) { throw new RuntimeException('محافظت پوشهٔ موقت انجام نشد.'); }
    }
}

function bargheto_city_upload_archive225($path, $manifest) {
    $native = class_exists('ZipArchive');
    if ($native) {
        $zip = new ZipArchive();
        if ($zip->open($path) !== true) { throw new RuntimeException('فایل ZIP خوانده نشد؛ بستهٔ رسانه‌ها را دوباره انتخاب کنید.'); }
        $entries = array();
        for ($i=0; $i<$zip->numFiles; $i++) { $row=$zip->statIndex($i); $entries[]=array('name'=>$row['name'], 'size'=>$row['size']); }
    } else {
        require_once ABSPATH . 'wp-admin/includes/class-pclzip.php';
        $zip = new PclZip($path); $rows=$zip->listContent();
        if (!is_array($rows)) { throw new RuntimeException('فایل ZIP خوانده نشد.'); }
        $entries=array(); foreach ($rows as $row) { $entries[]=array('name'=>$row['filename'], 'size'=>$row['size']); }
    }
    try {
        $seen=array();
        if (count($entries) > count($manifest)+3) { throw new RuntimeException('تعداد فایل‌های بسته معتبر نیست.'); }
        foreach ($entries as $row) {
            $name=$row['name'];
            if (isset($seen[$name]) || !bargheto_city_portable_safe_path($name)) { throw new RuntimeException('مسیر تکراری یا نامعتبر در ZIP.'); }
            $seen[$name]=true;
            if (isset($manifest[$name])) {
                if ((int)$row['size'] !== $manifest[$name]['size']) { throw new RuntimeException('حجم فایل داخل بسته درست نیست: ' . basename($name)); }
            } elseif (!in_array($name,array('manifest.json','README-FA.txt','web.config'),true) || (int)$row['size'] > 100000) {
                throw new RuntimeException('فایل غیرمجاز در بسته: ' . basename($name));
            }
        }
        foreach ($manifest as $name=>$spec) { if (!isset($seen[$name])) { throw new RuntimeException('بستهٔ رسانه کامل نیست: ' . basename($name)); } }
        return array($zip, $native);
    } catch (Throwable $e) { if ($native) { $zip->close(); } throw $e; }
}

function bargheto_city_upload_extract225($archive, $native, $name, $dest, $spec) {
    if (!wp_mkdir_p(dirname($dest))) { throw new RuntimeException('پوشهٔ استخراج ساخته نشد.'); }
    if ($native) {
        $src=$archive->getStream($name); $sink=@fopen($dest,'wb');
        if (!$src || !$sink) { if (is_resource($src)) fclose($src); if (is_resource($sink)) fclose($sink); throw new RuntimeException('استخراج رسانه انجام نشد.'); }
        try { $size=stream_copy_to_stream($src,$sink,$spec['size']+1); }
        finally { fclose($src); fclose($sink); }
        if ($size !== $spec['size']) { throw new RuntimeException('فایل استخراج‌شده ناقص است.'); }
    } else {
        // The allow-list and exact sizes were validated before this extraction.
        $base=substr($dest,0,-strlen($name)-1);
        $rows=$archive->extract(PCLZIP_OPT_PATH,$base,PCLZIP_OPT_BY_NAME,array($name));
        if (!is_array($rows) || count($rows)!==1) { throw new RuntimeException('استخراج رسانه انجام نشد.'); }
    }
    if (!bargheto_city_media_matches211($dest,$spec)) { throw new RuntimeException('صحت فایل تأیید نشد: ' . basename($name)); }
}

function bargheto_city_upload_dispatch225($op, $dir, &$state, $loc, $manifest) {
    $payload=$dir.'/payload.zip';
    if ($state['catalog'] !== hash('sha256',wp_json_encode($manifest))) { throw new RuntimeException('نسخهٔ رسانه‌ها عوض شده است؛ بارگذاری تازه‌ای شروع کنید.'); }
    if ($op === 'status') {
        $already_ready=$state['phase']==='upload' && bargheto_city_media_already_ready229($manifest,$loc);
        if ($already_ready) { $state['phase']='done'; $state['index']=count($manifest); }
        clearstatcache(true,$payload);
        return array('alreadyReady'=>$already_ready,'offset'=>is_file($payload)?filesize($payload):0,'phase'=>$state['phase'],'index'=>$state['index'],'total'=>count($manifest),'chunkSize'=>bargheto_city_upload_chunk_size225());
    }
    if ($op === 'chunk') {
        if ($state['phase'] !== 'upload') { return array('offset'=>$state['size']); }
        $chunk=$_FILES['chunk']??array();
        if (($chunk['error']??-1)!==UPLOAD_ERR_OK || !is_uploaded_file($chunk['tmp_name']??'')) { throw new RuntimeException('قطعهٔ فایل به PHP نرسید؛ محدودیت بارگذاری یا فضای موقت سرور را بررسی کنید.'); }
        $length=filesize($chunk['tmp_name']);
        $offset=filter_var($_POST['offset']??null,FILTER_VALIDATE_INT);
        if ($offset===false || $offset<0 || $length<1 || $length>bargheto_city_upload_chunk_size225() || $offset+$length>$state['size']) { throw new RuntimeException('اندازه یا موقعیت قطعه معتبر نیست.'); }
        $out=@fopen($payload,'c+b');
        if (!$out) { throw new RuntimeException('فایل موقت قابل نوشتن نیست؛ فضای دیسک و دسترسی پوشه را بررسی کنید.'); }
        try {
            $current=fstat($out)['size'];
            if ($offset===$current) {
                fseek($out,$current); $src=fopen($chunk['tmp_name'],'rb');
                try { $written=stream_copy_to_stream($src,$out,$length); } finally { fclose($src); }
                if ($written!==$length || !fflush($out)) { ftruncate($out,$current); throw new RuntimeException('نوشتن قطعه کامل نشد؛ فضای دیسک را بررسی کنید.'); }
                $current+=$written;
            } elseif ($offset+$length<=$current) {
                // A lost response may cause an identical chunk to be sent again.
                fseek($out,$offset); $bytes=fread($out,$length);
                if (!hash_equals(hash_file('sha256',$chunk['tmp_name']),hash('sha256',$bytes))) { throw new RuntimeException('قطعهٔ تکراری با دادهٔ ذخیره‌شده یکسان نیست.'); }
            } else { throw new RuntimeException('ترتیب قطعه‌ها عوض شده است؛ ادامهٔ بارگذاری را بزنید.'); }
        } finally { fclose($out); }
        return array('offset'=>$current);
    }
    if ($op === 'prepare') {
        if ($state['phase'] !== 'upload') { return array('phase'=>$state['phase'],'index'=>$state['index'],'total'=>count($manifest)); }
        clearstatcache(true,$payload);
        if (!is_file($payload) || filesize($payload)!==$state['size']) { throw new RuntimeException('هنوز همهٔ قطعه‌های ZIP دریافت نشده‌اند.'); }
        list($zip,$native)=bargheto_city_upload_archive225($payload,$manifest); if ($native) $zip->close();
        $state['phase']='install'; $state['index']=0;
        return array('phase'=>'install','index'=>0,'total'=>count($manifest));
    }
    if ($op === 'step') {
        if ($state['phase']==='done') { return array('done'=>true,'index'=>count($manifest),'total'=>count($manifest)); }
        if ($state['phase']!=='install') { throw new RuntimeException('بارگذاری ZIP هنوز تمام نشده است.'); }
        $names=array_keys($manifest); $index=$state['index'];
        if ($index>=count($names)) {
            if (file_put_contents($loc['path'].'/web.config',bargheto_city_media_iis_config(),LOCK_EX)===false) { throw new RuntimeException('تنظیم MIME رسانه‌ها قابل نوشتن نیست.'); }
            $report=array('checked'=>count($manifest),'valid'=>$names,'restored'=>$state['restored'],'cached'=>count($manifest),'errors'=>array(),'warnings'=>array(),'busy'=>false);
            update_option('bargheto_city_media_report221',$report,false);
            delete_option('bargheto_city_media_error211');
            update_option('bargheto_city_media_receipt221',array('checked_at'=>time(),'fingerprint'=>bargheto_city_media_fingerprint221($manifest,$loc)),false);
            $state['phase']='done';
            return array('done'=>true,'index'=>count($names),'total'=>count($names));
        }
        $name=$names[$index]; $spec=$manifest[$name]; $target=$loc['path'].'/'.$name;
        $lock=@fopen($loc['root'].'/.media-repair.lock','c');
        if (!$lock) { throw new RuntimeException('قفل رسانه‌ها قابل نوشتن نیست.'); }
        if (!flock($lock,LOCK_EX|LOCK_NB)) { fclose($lock); throw new RuntimeException('بررسی دیگری در حال اجراست؛ چند لحظه دیگر ادامه دهید.'); }
        try {
            $recovery=$loc['root'].'/.media-recovery'; bargheto_city_upload_private225($recovery);
            if (!bargheto_city_media_matches211($target,$spec)) {
                list($zip,$native)=bargheto_city_upload_archive225($payload,$manifest);
                try {
                    $dest=$dir.'/extract/'.$name;
                    bargheto_city_upload_extract225($zip,$native,$name,$dest,$spec);
                    bargheto_city_media_publish221($dest,$target,$spec,$recovery.'/quarantine');
                    @unlink($dest);
                } finally { if ($native) $zip->close(); }
                $state['restored'][]=$name;
                $revisions=get_option('bargheto_city_media_revisions221',array()); if (!is_array($revisions)) $revisions=array();
                $revisions[$name]=max(0,(int)($revisions[$name]??0))+1; update_option('bargheto_city_media_revisions221',$revisions,false);
            }
            bargheto_city_media_publish221($target,bargheto_city_recovery_path221($loc,$spec),$spec);
            // Remove this file's stale error without triggering a full scan per chunk.
            $report=get_option('bargheto_city_media_report221',array());
            if (isset($report['errors'][$name])) { unset($report['errors'][$name]); update_option('bargheto_city_media_report221',$report,false); }
            delete_option('bargheto_city_media_receipt221');
            $state['index']++;
            return array('done'=>false,'index'=>$state['index'],'total'=>count($names),'name'=>basename($name));
        } finally { flock($lock,LOCK_UN); fclose($lock); }
    }
    throw new RuntimeException('مرحلهٔ بارگذاری معتبر نیست.');
}

function bargheto_city_media_upload_ajax225() {
    if (!current_user_can('manage_options')) { wp_send_json_error(array('message'=>'دسترسی کافی نیست.'),403); }
    if (($_SERVER['REQUEST_METHOD']??'')!=='POST') { wp_send_json_error(array('message'=>'درخواست معتبر نیست.'),405); }
    if (!check_ajax_referer('bargheto_city_media225','nonce',false)) { wp_send_json_error(array('message'=>'اعتبار صفحه تمام شده؛ صفحه را تازه کنید و ادامه دهید.'),403); }
    wp_raise_memory_limit('admin'); @set_time_limit(60);
    $lock=null; $dir=''; $remove=false; $response=null; $error='';
    try {
        $loc=bargheto_city_media_location(); if (is_wp_error($loc)) throw new RuntimeException($loc->get_error_message());
        if (!wp_mkdir_p($loc['path'])) throw new RuntimeException('پوشهٔ رسانه قابل نوشتن نیست.');
        $manifest=bargheto_city_install_manifest211();
        $base=$loc['root'].'/.media-incoming'; bargheto_city_upload_private225($base);
        $op=(string)($_POST['op']??''); $user=get_current_user_id();
        if ($op==='init') {
            $size=filter_var($_POST['size']??null,FILTER_VALIDATE_INT);
            if ($size===false || $size<1 || $size>150*1024*1024) throw new RuntimeException('بسته باید ZIP و حداکثر ۱۵۰ مگابایت باشد.');
            // Bound abandoned upload storage. Active transfers are never deleted.
            $active=0;
            foreach (glob($base.'/*',GLOB_ONLYDIR)?:array() as $old) {
                $saved=json_decode((string)@file_get_contents($old.'/state.json'),true);
                if (is_array($saved) && ($saved['expires']??0)<time()) {
                    $oldlock=@fopen($old.'/session.lock','c');
                    if ($oldlock && flock($oldlock,LOCK_EX|LOCK_NB)) { bargheto_city_media_remove_tree($old); flock($oldlock,LOCK_UN); }
                    if ($oldlock) fclose($oldlock);
                } else { $active++; }
            }
            if ($active>=8) throw new RuntimeException('تعداد بارگذاری‌های ناتمام زیاد است؛ بارگذاری قبلی را ادامه دهید یا لغو کنید.');
            $id=wp_generate_uuid4(); $dir=$base.'/'.$id;
            if (!wp_mkdir_p($dir)) throw new RuntimeException('پوشهٔ بارگذاری ساخته نشد.');
            $state=array('owner'=>$user,'size'=>$size,'phase'=>'upload','index'=>0,'restored'=>array(),'expires'=>time()+86400,'catalog'=>hash('sha256',wp_json_encode($manifest)));
            // A recent full verification plus an unchanged disk fingerprint avoids
            // transmitting the same 85 MB media pack after every Light update.
            $already_ready=bargheto_city_media_already_ready229($manifest,$loc);
            if ($already_ready) { $state['phase']='done'; $state['index']=count($manifest); }
            bargheto_city_upload_save225($dir,$state);
            $response=array('id'=>$id,'offset'=>0,'phase'=>$state['phase'],'index'=>$state['index'],'total'=>count($manifest),'chunkSize'=>bargheto_city_upload_chunk_size225(),'alreadyReady'=>$already_ready);
        } else {
            $id=(string)($_POST['id']??'');
            if (!preg_match('/\A[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}\z/D',$id)) throw new RuntimeException('شناسهٔ بارگذاری معتبر نیست.');
            $dir=$base.'/'.$id;
            if (!is_dir($dir) || is_link($dir)) {
                if ($op==='cancel' && !is_link($dir)) { wp_send_json_success(array('removed'=>true)); }
                throw new RuntimeException('بارگذاری قبلی پیدا نشد؛ بارگذاری تازه‌ای شروع کنید.');
            }
            $lock=@fopen($dir.'/session.lock','c');
            if (!$lock || !flock($lock,LOCK_EX|LOCK_NB)) throw new RuntimeException('درخواست قبلی هنوز در حال پردازش است؛ دوباره ادامه دهید.');
            $state=json_decode((string)@file_get_contents($dir.'/state.json'),true);
            if (!is_array($state) || ($state['owner']??0)!==$user || ($op!=='cancel' && ($state['expires']??0)<time())) throw new RuntimeException('بارگذاری قبلی منقضی شده یا متعلق به این حساب نیست؛ بارگذاری تازه‌ای شروع کنید.');
            if ($op==='cancel' || ($op==='ack' && $state['phase']==='done')) { $remove=true; $response=array('removed'=>true); }
            else { $response=bargheto_city_upload_dispatch225($op,$dir,$state,$loc,$manifest); $state['expires']=time()+86400; bargheto_city_upload_save225($dir,$state); }
        }
    } catch (Throwable $e) { $error=$e->getMessage(); }
    finally { if (is_resource($lock)) { flock($lock,LOCK_UN); fclose($lock); } }
    if ($remove) bargheto_city_media_remove_tree($dir);
    if ($error!=='') { wp_send_json_error(array('message'=>$error),400); }
    wp_send_json_success($response);
}
add_action('wp_ajax_bargheto_city_media225','bargheto_city_media_upload_ajax225');
