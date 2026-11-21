<?php
/** Persistent public media, separate from replaceable plugin code. */
if (!defined('ABSPATH')) { exit; }
function bargheto_city_server_manifest109() {
    static $manifest;
    if ($manifest === null) { $manifest = json_decode(file_get_contents(__DIR__.'/server-media-manifest.json'),true); }
    return is_array($manifest) ? $manifest : array();
}
function bargheto_city_server_base109() {
    $location=bargheto_city_media_location();
    return is_wp_error($location) ? '' : $location['url'];
}
function bargheto_city_server_url109($relative) {
    $manifest=bargheto_city_server_manifest109();
    return isset($manifest[$relative]) ? bargheto_city_server_base109().$relative.'?sha='.substr($manifest[$relative]['sha256'],0,16).(function_exists('bargheto_city_media_cache_suffix221')?bargheto_city_media_cache_suffix221($relative):'') : '';
}
function bargheto_city_server_urls109() {
    if (function_exists('bargheto_city_repair_missing221')) { bargheto_city_repair_missing221(); }
    $out=array();foreach(bargheto_city_server_manifest109() as $relative=>$spec) { $out[basename($relative)]=bargheto_city_server_url109($relative); }return $out;
}
function bargheto_city_server_missing109($verify_hash = false) {
    $loc=bargheto_city_media_location();$out=array();
    $repair_report221=get_option('bargheto_city_media_report221',array());
    foreach(bargheto_city_server_manifest109() as $relative=>$spec) {
        $file=is_wp_error($loc)?'':$loc['path'].'/'.$relative;
        clearstatcache(true,$file);
        if(!is_file($file)||filesize($file)!==$spec['size']||(($verify_hash||isset($repair_report221['errors'][$relative]))&&!bargheto_city_media_matches211($file,$spec)))$out[]=$relative;
    }return $out;
}
require_once __DIR__ . '/media-upload-2.5.225.php';

/** Legacy no-JavaScript importer; the admin UI uses the resumable uploader. */
function bargheto_city_upload_extra_media109() {
    if (!current_user_can('manage_options')) { wp_die('دسترسی کافی نیست.', '', array('response'=>403)); }
    check_admin_referer('bargheto_city_import_extra109');
    $file=$_FILES['media109']??array();
    if (empty($_FILES) && (int)($_SERVER['CONTENT_LENGTH']??0)>0) { wp_die('حجم درخواست از سقف PHP بیشتر است یا فایل به سرور نرسیده است. به مدیریت شهر برگردید و بارگذاری مرحله‌ای را با جاوااسکریپت فعال انجام دهید.'); }
    $upload_errors225=array(UPLOAD_ERR_INI_SIZE=>'حجم ZIP از upload_max_filesize سرور بیشتر است.',UPLOAD_ERR_FORM_SIZE=>'حجم ZIP از سقف فرم بیشتر است.',UPLOAD_ERR_PARTIAL=>'بارگذاری ناقص مانده است.',UPLOAD_ERR_NO_FILE=>'فایل انتخاب نشده است.',UPLOAD_ERR_NO_TMP_DIR=>'پوشهٔ موقت PHP وجود ندارد.',UPLOAD_ERR_CANT_WRITE=>'PHP نمی‌تواند روی دیسک بنویسد.',UPLOAD_ERR_EXTENSION=>'یک افزونهٔ PHP بارگذاری را متوقف کرده است.');
    if (isset($upload_errors225[$file['error']??-1])) { wp_die(esc_html($upload_errors225[$file['error']]).' از بارگذاری مرحله‌ای مدیریت شهر استفاده کنید.'); }
    if (($_SERVER['REQUEST_METHOD']??'')!=='POST' || ($file['error']??-1)!==UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name']??'') || ($file['size']??0)>150*1024*1024) { wp_die('ZIP رسانه یا حجم بارگذاری معتبر نیست؛ سقف بارگذاری سرور را بررسی کنید.'); }
    wp_raise_memory_limit('admin'); @set_time_limit(0);
    $loc=bargheto_city_media_location(); if(is_wp_error($loc)||!wp_mkdir_p($loc['path'])) { wp_die('پوشهٔ رسانه قابل نوشتن نیست.'); }
    try { $manifest=bargheto_city_install_manifest211(); } catch(Throwable $e) { wp_die(esc_html($e->getMessage())); }
    $native=class_exists('ZipArchive'); $stage=$loc['root'].'/.assets-import-'.wp_generate_uuid4(); $seen=array();
    if($native){$zip=new ZipArchive();if($zip->open($file['tmp_name'])!==true)wp_die('ZIP خوانده نشد.');$entries=array();for($i=0;$i<$zip->numFiles;$i++){$row=$zip->statIndex($i);$entries[]=array('name'=>$row['name'],'size'=>$row['size']);}}
    else{require_once ABSPATH.'wp-admin/includes/class-pclzip.php';$zip=new PclZip($file['tmp_name']);$list=$zip->listContent();if(!is_array($list))wp_die('ZIP خوانده نشد.');$entries=array();foreach($list as $row)$entries[]=array('name'=>$row['filename'],'size'=>$row['size']);}
    foreach($entries as $entry){$name=$entry['name'];
        if(!bargheto_city_portable_safe_path($name)||isset($seen[$name]))wp_die('مسیر تکراری یا نامعتبر در ZIP.');$seen[$name]=true;
        if(isset($manifest[$name])){if((int)$entry['size']!==$manifest[$name]['size'])wp_die('حجم فایل درست نیست: '.esc_html($name));}
        elseif(!in_array($name,array('manifest.json','README-FA.txt','web.config'),true)||(int)$entry['size']>100000)wp_die('فایل غیرمجاز در ZIP: '.esc_html($name));
    }
    foreach($manifest as $name=>$spec)if(!isset($seen[$name]))wp_die('بستهٔ رسانه کامل نیست: '.esc_html($name));
    if(!wp_mkdir_p($stage))wp_die('فضای موقت ساخته نشد.');
    $backup=$stage.'/backup';$done=array();$lock=null;$keep_stage=false;$error='';
    try{
        // Validate the entire archive before publishing any replacement.
        foreach($manifest as $name=>$spec){$dest=$stage.'/'.$name;if(!wp_mkdir_p(dirname($dest)))throw new RuntimeException('ساخت پوشه انجام نشد.');
            if($native){$src=$zip->getStream($name);$sink=fopen($dest,'wb');if(!$src||!$sink)throw new RuntimeException('استخراج انجام نشد.');$n=stream_copy_to_stream($src,$sink,$spec['size']+1);fclose($src);fclose($sink);if($n!==$spec['size'])throw new RuntimeException('فایل ناقص است.');}
        }
        if(!$native){$r=$zip->extract(PCLZIP_OPT_PATH,$stage,PCLZIP_OPT_BY_NAME,array_keys($manifest));if(!is_array($r)||count($r)!==count($manifest))throw new RuntimeException('استخراج کامل نشد.');}
        foreach($manifest as $name=>$spec)if(!bargheto_city_media_matches211($stage.'/'.$name,$spec))throw new RuntimeException('صحت فایل تأیید نشد: '.$name);
        if($native)$zip->close();
        $lock=@fopen($loc['root'].'/.media-repair.lock','c');if(!$lock||!flock($lock,LOCK_EX|LOCK_NB))throw new RuntimeException('انتقال دیگری در حال اجراست؛ دوباره تلاش کنید.');
        foreach($manifest as $name=>$spec){$target=$loc['path'].'/'.$name;if(bargheto_city_media_matches211($target,$spec))continue;
            if(is_link($target)||is_dir($target))throw new RuntimeException('مسیر مقصد معتبر نیست: '.$name);
            $old=$backup.'/'.$name;if(!wp_mkdir_p(dirname($target))||!wp_mkdir_p(dirname($old)))throw new RuntimeException('پوشه مقصد آماده نشد.');
            $exists=is_file($target);if($exists&&!rename($target,$old))throw new RuntimeException('پشتیبان فایل ساخته نشد.');
            $done[]=array($target,$old,$exists);if(!rename($stage.'/'.$name,$target))throw new RuntimeException('نصب فایل انجام نشد.');@chmod($target,0644);
            if(!bargheto_city_media_matches211($target,$spec))throw new RuntimeException('فایل مقصد تأیید نشد.');
        }
        if(file_put_contents($loc['path'].'/web.config',bargheto_city_media_iis_config(),LOCK_EX)===false)throw new RuntimeException('تنظیم MIME نوشته نشد.');
        $revisions=get_option('bargheto_city_media_revisions221',array());if(!is_array($revisions))$revisions=array();
        foreach($done as $row){$name=substr($row[0],strlen($loc['path'])+1);$revisions[$name]=max(0,(int)($revisions[$name]??0))+1;}update_option('bargheto_city_media_revisions221',$revisions,false);
        delete_option('bargheto_city_media_error211');delete_option('bargheto_city_media_receipt221');
    }catch(Throwable $e){
        foreach(array_reverse($done) as $row){if(is_file($row[0])&&!@unlink($row[0]))$keep_stage=true;if($row[2]&&!@rename($row[1],$row[0]))$keep_stage=true;}
        $error=$e->getMessage().($keep_stage?' نسخه‌های قبلی برای بازیابی نگهداری شدند: '.$backup:'');
    }finally{if($lock){flock($lock,LOCK_UN);fclose($lock);}if(!$keep_stage)bargheto_city_media_remove_tree($stage);}
    if($error!=='')wp_die(esc_html($error));
    // Keep a durable recovery copy; later Light updates carry no media payload.
    bargheto_city_install_bundled211();
    wp_safe_redirect(add_query_arg(array('page'=>'bargheto-city','extra_installed109'=>'1'),admin_url('admin.php')));exit;
}
add_action('admin_post_bargheto_city_upload_extra_media109','bargheto_city_upload_extra_media109');
function bargheto_city_server_admin109(){
 if (!current_user_can('manage_options')) { return; }
 ?>
 <h2>بارگذاری بستهٔ رسانه‌ها (عکس، مدل و صدا)</h2>
 <p>پس از نصب افزونهٔ لایت، فایل Bargheto-City-2.5.223-Server-Media.zip را یک‌بار اینجا بارگذاری کنید. عکس‌ها، مدل‌ها و صداها مستقل از افزونه نگهداری می‌شوند؛ فایل‌های سالم دوباره جایگزین نمی‌شوند.</p>
 <?php if (isset($_GET['extra_installed109']) && $_GET['extra_installed109'] === '1'): ?>
 <div class="notice notice-success inline"><p>بستهٔ رسانه‌ها با موفقیت روی سرور نصب شد.</p></div>
 <?php endif; ?>
 <style>#bargheto-media-form225 [hidden]{display:none!important}</style>
 <form id="bargheto-media-form225" method="post" enctype="multipart/form-data" action="<?php echo esc_url(add_query_arg('action','bargheto_city_upload_extra_media109',admin_url('admin-post.php'))); ?>">
 <input type="hidden" name="action" value="bargheto_city_upload_extra_media109"><?php wp_nonce_field('bargheto_city_import_extra109'); ?>
 <p><label for="bargheto-city-media112">بستهٔ رسانه‌ها (ZIP)</label></p>
 <input id="bargheto-city-media112" type="file" name="media109" accept=".zip,application/zip" required>
 <p class="description">فایل در قطعه‌های کوچک ارسال و رسانه‌ها مرحله‌به‌مرحله نصب می‌شوند. در صورت قطع ارتباط، همین فایل را انتخاب کنید و ادامه دهید.</p>
 <?php submit_button('بارگذاری و نصب رسانه‌ها'); ?>
 <div dir="rtl" style="max-width:620px;text-align:right">
 <progress id="bargheto-media-progress225" max="100" value="0" aria-label="پیشرفت بارگذاری و نصب رسانه‌ها" style="width:100%;height:20px" hidden></progress>
 <p id="bargheto-media-message225" role="status" aria-live="polite" style="white-space:pre-wrap;overflow-wrap:anywhere"></p>
 <button type="button" id="bargheto-media-pause225" class="button" hidden>توقف</button>
 <button type="button" id="bargheto-media-reset225" class="button" hidden>شروع دوباره</button>
 <button type="button" id="bargheto-media-refresh225" class="button button-primary" hidden>به‌روزرسانی وضعیت صفحه</button>
 </div>
 <noscript><p>برای نمایش پیشرفت و ادامهٔ بارگذاری، جاوااسکریپت مرورگر را فعال کنید. بارگذاری معمولی به سقف حجم سرور وابسته است.</p></noscript>
 </form>
 <?php $config225=array('url'=>admin_url('admin-ajax.php','relative'),'nonce'=>wp_create_nonce('bargheto_city_media225'),'user'=>get_current_user_id(),'catalog'=>hash('sha256',wp_json_encode(bargheto_city_install_manifest211())),'maxSize'=>150*1024*1024); ?>
 <script id="bargheto-media-config225" type="application/json"><?php echo wp_json_encode($config225,JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT); ?></script>
 <script src="<?php echo esc_url(plugins_url('admin/media-upload-2.5.229.js',__FILE__)); ?>"></script>
 <?php
}
