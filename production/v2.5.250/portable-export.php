<?php
/** Installable, self-contained city transfer. No WordPress accounts or live sessions. */
if (!defined('ABSPATH')) { exit; }

function bargheto_city_portable_version() {
    $header = get_file_data(__DIR__ . '/bargheto-city.php', array('version'=>'Version'), 'plugin');
    return preg_replace('/[^0-9A-Za-z._-]/', '', $header['version'] ?? 'unknown');
}
function bargheto_city_portable_key($key) {
    return is_string($key) && (preg_match('/^bargheto_city_(layout_[1-9][0-9]{0,9}|bess_[a-f0-9]{64})$/D', $key)
        || in_array($key, array('bargheto_city_installed_media_version', 'bargheto_city_turn_config', 'bargheto_city_office97_layout'), true));
}
function bargheto_city_portable_turn() {
    $saved = get_option('bargheto_city_turn_config', array());
    return array('urls'=>defined('BARGHETO_CITY_TURN_URLS') ? BARGHETO_CITY_TURN_URLS : ($saved['urls'] ?? ''),
        'secret'=>defined('BARGHETO_CITY_TURN_SECRET') ? BARGHETO_CITY_TURN_SECRET : ($saved['secret'] ?? ''));
}
function bargheto_city_portable_safe_path($path) {
    if (!is_string($path) || $path === '' || strlen($path)>2048 || strpos($path, chr(0))!==false || strpos($path, '\\')!==false || preg_match('~(^/|:|(^|/)\.{1,2}(/|$))~', $path)) { return false; }
    return !in_array('', explode('/', $path), true);
}
function bargheto_city_portable_encode($data) {
    $json = wp_json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false) { throw new RuntimeException('تبدیل داده به JSON انجام نشد.'); }
    // The payload cannot be downloaded as plaintext even if Apache deny rules are ignored.
    return "<?php exit; /* BARGHETO_PORTABLE_DATA\n" . base64_encode($json) . "\n*/\n";
}
function bargheto_city_portable_decode($file) {
    if (!is_readable($file)) { throw new RuntimeException('فایل داده بسته خواندنی نیست.'); }
    $raw = file_get_contents($file);
    if (!is_string($raw) || !preg_match('~\A<\?php exit; /\* BARGHETO_PORTABLE_DATA\n([A-Za-z0-9+/=]+)\n\*/\n\z~D', $raw, $m)) { throw new RuntimeException('ساختار داده بسته معتبر نیست.'); }
    $json = base64_decode($m[1], true); $value = json_decode($json === false ? '' : $json, true, 128);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($value)) { throw new RuntimeException('JSON بسته معتبر نیست.'); }
    return $value;
}
function bargheto_city_portable_files($root, $exclude_temporary = false, $exclude_payload = false) {
    if (!is_dir($root)) { return array(); }
    if (is_link($root)) { throw new RuntimeException('پوشه پیوندی قابل انتقال نیست: ' . basename($root)); }
    $result = array();
    $walk = function($directory, $prefix) use (&$walk, &$result, $exclude_temporary, $exclude_payload) {
        $names = scandir($directory);
        if ($names === false) { throw new RuntimeException('خواندن پوشه انجام نشد: ' . $prefix); }
        foreach ($names as $name) {
            if ($name === '.' || $name === '..') { continue; }
            if (($exclude_payload && $prefix === '' && $name === 'portable-data') || ($exclude_temporary && preg_match('/^\.(assets-(import|backup)-|portable-)/', $name))) { continue; }
            $relative = $prefix . $name; $path = $directory . '/' . $name;
            if (!bargheto_city_portable_safe_path($relative) || is_link($path)) { throw new RuntimeException('مسیر یا پیوند قابل انتقال نیست: ' . $relative); }
            if (is_dir($path)) { $walk($path, $relative . '/'); }
            elseif (is_file($path) && is_readable($path)) { $result[$relative] = $path; }
            else { throw new RuntimeException('فایل قابل خواندن نیست: ' . $relative); }
        }
    };
    $walk(rtrim($root, '/'), ''); ksort($result); return $result;
}
function bargheto_city_portable_options() {
    global $wpdb;
    $keys = $wpdb->get_col($wpdb->prepare("SELECT option_name FROM {$wpdb->options} WHERE option_name LIKE %s ORDER BY option_name", $wpdb->esc_like('bargheto_city_') . '%'));
    if ($wpdb->last_error) { throw new RuntimeException('خواندن تنظیمات شهر انجام نشد.'); }
    $out = array();
    foreach ($keys as $key) { if (bargheto_city_portable_key($key)) { $out[$key] = get_option($key); } }
    $turn = bargheto_city_portable_turn();
    if ($turn['urls'] !== '' && $turn['secret'] !== '') { $out['bargheto_city_turn_config'] = $turn; }
    return $out;
}
function bargheto_city_portable_add($zip, $path, $entry, &$manifest) {
    clearstatcache(true, $path); $size = filesize($path); $hash = hash_file('sha256', $path);
    if ($size === false || $hash === false || !$zip->addFile($path, 'bargheto-city/' . $entry)) { throw new RuntimeException('افزودن فایل به ZIP انجام نشد: ' . $entry); }
    // Already-compressed media can be copied without expensive recompression.
    if (preg_match('/\.(glb|mp3|webp|png|jpe?g|woff2?|zip)$/i', $entry)) { $zip->setCompressionName('bargheto-city/' . $entry, ZipArchive::CM_STORE); }
    $manifest[$entry] = array('size'=>$size, 'sha256'=>$hash);
}
function bargheto_city_portable_build($target, $light = false) {
    global $wpdb;
    if (!class_exists('ZipArchive')) { throw new RuntimeException('برای خروجی کامل، افزونه PHP ZipArchive باید روی هاست فعال باشد.'); }
    $media = bargheto_city_media_status(true);
    if (!$light && ($media['missing'] || bargheto_city_server_missing109())) { throw new RuntimeException('خروجی کامل ساخته نشد؛ فایل‌های لازم سرور ناقص‌اند: ' . implode('، ', $media['missing'])); }
    $source = get_option('bargheto_city_portable_source', '');
    if (!$source) { $source = wp_generate_uuid4(); if (!add_option('bargheto_city_portable_source', $source, '', false)) { $source = get_option('bargheto_city_portable_source'); } }
    if (!is_string($source) || !$source) { throw new RuntimeException('شناسه مبدأ ثبت نشد.'); }
    $zip = new ZipArchive();
    if ($zip->open($target, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) { throw new RuntimeException('ساخت ZIP در فضای موقت سرور انجام نشد.'); }
    $manifest = array(); $tracked = array(); $transaction = false;
    try {
        foreach (bargheto_city_portable_files(__DIR__, true, true) as $relative=>$file) { if($light && bargheto_city_portable_heavy109($relative))continue; bargheto_city_portable_add($zip, $file, $relative, $manifest); $tracked[$relative] = $file; }
        foreach (bargheto_city_portable_files(is_wp_error($media['location'])?'':$media['location']['root'], true) as $relative=>$file) { if($light && bargheto_city_portable_heavy109($relative))continue; $entry = 'portable-data/uploads/' . $relative; bargheto_city_portable_add($zip, $file, $entry, $manifest); $tracked[$entry] = $file; }
        // Read persistent database records from one consistent database snapshot.
        if ($wpdb->query('START TRANSACTION WITH CONSISTENT SNAPSHOT') === false) { throw new RuntimeException('شروع خواندن یکپارچه پایگاه داده انجام نشد.'); }
        $transaction = true; $options = bargheto_city_portable_options(); $last = 0; $batches = array(); $count = 0;
        do {
            $rows = $wpdb->get_results($wpdb->prepare("SELECT ID,post_title,post_status,post_date,post_date_gmt,post_content,post_excerpt FROM {$wpdb->posts} WHERE post_type='bargheto_visitor' AND ID>%d ORDER BY ID LIMIT 500", $last), ARRAY_A);
            if ($wpdb->last_error) { throw new RuntimeException('خواندن اطلاعات بازدیدکنندگان انجام نشد.'); }
            $batch = array();
            if ($rows) { update_meta_cache('post', array_map('intval', array_column($rows, 'ID'))); }
            foreach ($rows as $row) {
                $last = (int)$row['ID']; $meta = get_post_meta($last); unset($meta['_bc_portable_origin']); foreach (array_keys($meta) as $key) { $meta[$key] = get_post_meta($last, $key, false); }
                $batch[] = array('id'=>$last, 'post'=>$row, 'meta'=>$meta); wp_cache_delete($last, 'post_meta');
            }
            if ($batch) {
                $name = 'portable-data/visitors-' . sprintf('%06d', count($batches)) . '.php';
                $content = bargheto_city_portable_encode($batch);
                if (!$zip->addFromString('bargheto-city/' . $name, $content)) { throw new RuntimeException('افزودن داده بازدیدکنندگان انجام نشد.'); }
                $manifest[$name] = array('size'=>strlen($content), 'sha256'=>hash('sha256', $content)); $batches[] = $name; $count += count($batch);
            }
        } while (count($rows) === 500);
        if ($wpdb->query('COMMIT') === false) { throw new RuntimeException('پایان خواندن داده‌ها انجام نشد.'); } $transaction = false;
        $snapshot = array('format'=>1, 'media_mode'=>$light?'external':'full', 'id'=>wp_generate_uuid4(), 'source'=>$source, 'version'=>bargheto_city_portable_version(), 'created_at'=>gmdate('c'), 'options'=>$options,
            'visitors'=>$batches, 'visitor_count'=>$count, 'origins'=>array('uploads'=>wp_upload_dir()['baseurl'] . '/bargheto-city', 'plugin'=>plugins_url('', __FILE__), 'home'=>home_url()),
            'turn_included'=>!empty($options['bargheto_city_turn_config']), 'files'=>$manifest);
        if (!$zip->addFromString('bargheto-city/portable-data/snapshot.php', bargheto_city_portable_encode($snapshot))
            || !$zip->addFromString('bargheto-city/portable-data/.htaccess', "Require all denied\n")
            || !$zip->addFromString('bargheto-city/portable-data/web.config', '<?xml version="1.0"?><configuration><system.webServer><security><authorization><clear/><add accessType="Deny" users="*"/></authorization></security></system.webServer></configuration>')
            || !$zip->addFromString('bargheto-city/portable-data/index.php', '<?php exit;')) { throw new RuntimeException('ثبت داده نهایی بسته انجام نشد.'); }
        if (!$zip->close()) { throw new RuntimeException('تکمیل ZIP انجام نشد؛ فضای دیسک را بررسی کنید.'); }
        foreach ($tracked as $entry=>$file) {
            clearstatcache(true, $file);
            if (!is_file($file) || filesize($file) !== $manifest[$entry]['size'] || !hash_equals($manifest[$entry]['sha256'], hash_file('sha256', $file))) { throw new RuntimeException('فایل حین تهیه خروجی تغییر کرد؛ دوباره خروجی بگیرید: ' . $entry); }
        }
        return array('files'=>count($manifest), 'visitors'=>$count);
    } catch (Throwable $e) {
        if ($transaction) { $wpdb->query('ROLLBACK'); }
        try { $zip->close(); } catch (Throwable $ignored) {}
        @unlink($target); throw $e;
    }
}
function bargheto_city_portable_export() {
    if (!current_user_can('manage_options')) { wp_die('دسترسی کافی ندارید.', '', array('response'=>403)); }
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') { wp_die('درخواست معتبر نیست.', '', array('response'=>405)); }
    check_admin_referer('bargheto_city_portable_export');
    wp_raise_memory_limit('admin'); @set_time_limit(0);
    $file = wp_tempnam('bargheto-city-export.zip');
    if (!$file) { wp_die('ساخت فایل موقت ممکن نیست.'); }
    register_shutdown_function(function() use ($file) { if (is_file($file)) { @unlink($file); } });
    $light=($_POST['media_mode']??'')==='external';
    try { bargheto_city_portable_build($file,$light); }
    catch (Throwable $e) { wp_die(esc_html($e->getMessage()), 'خروجی کامل شهر', array('response'=>500, 'back_link'=>true)); }
    while (ob_get_level()) { ob_end_clean(); }
    nocache_headers(); header('Content-Type: application/zip'); header('X-Content-Type-Options: nosniff');
    header('Content-Disposition: attachment; filename="Bargheto-City-' . ($light?'Light-':'Full-') . bargheto_city_portable_version() . '-' . gmdate('Y-m-d-His') . '.zip"'); header('Content-Length: ' . filesize($file));
    $stream = fopen($file, 'rb'); if ($stream) { fpassthru($stream); fclose($stream); } @unlink($file); exit;
}
add_action('admin_post_bargheto_city_portable_export', 'bargheto_city_portable_export');

function bargheto_city_portable_validate($directory) {
    $snapshot = bargheto_city_portable_decode($directory . '/portable-data/snapshot.php');
    if (($snapshot['format'] ?? null) !== 1 || !is_string($snapshot['id'] ?? null) || !preg_match('/^[a-f0-9-]{36}$/D', $snapshot['id'])
        || !is_string($snapshot['source'] ?? null) || !preg_match('/^[a-f0-9-]{36}$/D', $snapshot['source']) || !is_array($snapshot['files'] ?? null)
        || !is_array($snapshot['options'] ?? null) || !is_array($snapshot['visitors'] ?? null)) { throw new RuntimeException('نسخه یا ساختار بسته انتقال معتبر نیست.'); }
    $seen = array();
    foreach ($snapshot['files'] as $relative=>$spec) {
        if (!bargheto_city_portable_safe_path($relative) || !is_array($spec) || !is_int($spec['size'] ?? null) || $spec['size']<0 || !is_string($spec['sha256'] ?? null) || !preg_match('/^[a-f0-9]{64}$/D', $spec['sha256'])) { throw new RuntimeException('فهرست فایل‌های بسته معتبر نیست.'); }
        $file = $directory . '/' . $relative;
        // Reject symlinks in every path component, not only at the leaf.
        $part = $directory; foreach (explode('/', $relative) as $name) { $part .= '/' . $name; if (is_link($part)) { throw new RuntimeException('بسته دارای پیوند فایل است.'); } }
        clearstatcache(true, $file);
        if (!is_readable($file) || !is_file($file) || filesize($file) !== $spec['size'] || !hash_equals($spec['sha256'], hash_file('sha256', $file))) { throw new RuntimeException('فایل بسته ناقص یا تغییرکرده است: ' . $relative); }
        $seen[$relative] = true;
    }
    $mode=$snapshot['media_mode']??'full';
    if(!in_array($mode,array('external','full'),true))throw new RuntimeException('حالت رسانه بسته معتبر نیست.');
    if($mode==='full'){
        foreach (array_merge(bargheto_city_media_manifest(),bargheto_city_server_manifest109()) as $name=>$spec) {
            $key='portable-data/uploads/assets/'.$name;
            if(!isset($seen[$key])||$snapshot['files'][$key]!==$spec)throw new RuntimeException('بسته فاقد مدل یا صدای معتبر است: '.$name);
        }
    }
    foreach ($snapshot['options'] as $key=>$value) {
        if (!bargheto_city_portable_key($key)) { throw new RuntimeException('تنظیم غیرمجاز در بسته وجود دارد.'); }
        if ($key === 'bargheto_city_office97_layout' && (!is_array($value) || !is_int($value['revision'] ?? null) || $value['revision'] < 0 || bargheto_city_office97_validate($value['layout'] ?? null) === null)) { throw new RuntimeException('چیدمان دفتر معتبر نیست.'); }
        if (strpos($key, 'bargheto_city_layout_') === 0 && (!is_array($value) || bargheto_city_layout_validate($value['layout'] ?? null) === null)) { throw new RuntimeException('چیدمان ذخیره‌شده معتبر نیست.'); }
    }
    foreach ($snapshot['visitors'] as $name) { if (!is_string($name) || !preg_match('~^portable-data/visitors-[0-9]{6}\.php$~D', $name) || !isset($seen[$name])) { throw new RuntimeException('فهرست داده بازدیدکنندگان معتبر نیست.'); } }
    return $snapshot;
}
function bargheto_city_portable_rebase($value, $origins) {
    if (is_array($value)) { foreach ($value as $key=>$item) { $value[$key] = bargheto_city_portable_rebase($item, $origins); } return $value; }
    if (!is_string($value)) { return $value; }
    $uploads = wp_upload_dir();
    foreach (array('uploads'=>$uploads['baseurl'] . '/bargheto-city', 'plugin'=>plugins_url('', __FILE__), 'home'=>home_url()) as $kind=>$url) {
        $old = $origins[$kind] ?? '';
        if (is_string($old) && strlen($old)>8 && substr($value, 0, strlen($old)) === $old && (strlen($value) === strlen($old) || in_array(substr($value, strlen($old), 1), array('/', '?', '#'), true))) { return $url . substr($value, strlen($old)); }
    }
    return $value;
}
function bargheto_city_portable_restore($overwrite = false) {
    global $wpdb;
    $directory = __DIR__; $receipt = get_option('bargheto_city_portable_receipt', array());
    if (!is_file($directory . '/portable-data/snapshot.php') && !empty($receipt['id'])) { return $receipt; }
    $snapshot = bargheto_city_portable_validate($directory);
    if (($receipt['id'] ?? '') === $snapshot['id']) { return $receipt; }
    $location = bargheto_city_media_location(); if (is_wp_error($location)) { throw new RuntimeException('پوشه آپلود وردپرس در دسترس نیست.'); }
    $light=($snapshot['media_mode']??'full')==='external';
    if($light && (bargheto_city_media_status()['missing'] || bargheto_city_server_missing109()))throw new RuntimeException('ابتدا بسته فایل‌های سرور و بسته مدل‌ها و صداها را نصب کنید؛ خروجی سبک رسانه ندارد.');
    $old_options = bargheto_city_portable_options();
    $existing = bargheto_city_portable_files($location['root'], true);
    if (!$overwrite && ($old_options || $existing || (int)$wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type='bargheto_visitor'")>0)) { throw new RuntimeException('شهر مقصد داده دارد؛ بازیابی خودکار متوقف شد. برای جایگزینی، از دکمه بازیابی در همین پنل استفاده کنید.'); }
    // Core tables must support rollback before any destination write takes place.
    foreach (array($wpdb->options, $wpdb->posts, $wpdb->postmeta) as $table) {
        $engine = $wpdb->get_row($wpdb->prepare('SHOW TABLE STATUS WHERE Name=%s', $table), ARRAY_A);
        if (!$engine || strcasecmp($engine['Engine'] ?? '', 'InnoDB') !== 0) { throw new RuntimeException('بازیابی یکپارچه نیازمند InnoDB برای جدول ' . $table . ' است.'); }
    }
    wp_raise_memory_limit('admin'); @set_time_limit(0);
    $parent = dirname($location['root']); $suffix = str_replace('-', '', wp_generate_uuid4());
    $stage = $parent . '/.bc-portable-stage-' . $suffix; $backup = $parent . '/.bc-portable-backup-' . $suffix;
    if (!wp_mkdir_p($stage)) { throw new RuntimeException('ساخت پوشه موقت بازیابی انجام نشد.'); }
    $swapped = false; $had_old = false; $transaction = false; $post_ids = array(); $keys = array_unique(array_merge(array_keys($old_options), array_keys($snapshot['options']), array('bargheto_city_portable_receipt', 'bargheto_city_portable_source')));
    try {
        // A light restore overlays data while preserving all existing server media.
        if($light){foreach($existing as $relative=>$source){$target=$stage.'/'.$relative;if(!wp_mkdir_p(dirname($target))||!copy($source,$target))throw new RuntimeException('حفظ فایل‌های فعلی سرور انجام نشد.');}}
        foreach ($snapshot['files'] as $relative=>$spec) {
            $prefix = 'portable-data/uploads/'; if (strpos($relative, $prefix) !== 0) { continue; }
            $target = $stage . '/' . substr($relative, strlen($prefix));
            if (!wp_mkdir_p(dirname($target)) || !copy($directory . '/' . $relative, $target) || !hash_equals($spec['sha256'], hash_file('sha256', $target))) { throw new RuntimeException('کپی مدل یا داده انجام نشد: ' . $relative); }
            @chmod($target, 0644);
        }
        if ($wpdb->query('START TRANSACTION') === false) { throw new RuntimeException('تراکنش بازیابی شروع نشد.'); } $transaction = true;
        foreach ($old_options as $key=>$ignored) { if (!array_key_exists($key, $snapshot['options']) && !delete_option($key) && get_option($key, null) !== null) { throw new RuntimeException('حذف تنظیم قبلی شهر انجام نشد: ' . $key); } }
        foreach ($snapshot['options'] as $key=>$value) {
            $value = bargheto_city_portable_rebase($value, $snapshot['origins'] ?? array());
            if (strpos($key, 'bargheto_city_layout_') === 0) { $value['updated_by'] = get_current_user_id(); }
            if (strpos($key, 'bargheto_city_bess_') === 0) { $value['writer'] = ''; $value['writerUntil'] = 0; $value['updatedAt'] = microtime(true); }
            if (!update_option($key, $value, false) && get_option($key, null) !== $value) { throw new RuntimeException('ثبت تنظیمات انجام نشد: ' . $key); }
        }
        $visitor_count = 0;
        foreach ($snapshot['visitors'] as $name) {
            foreach (bargheto_city_portable_decode($directory . '/' . $name) as $visitor) {
                if (!is_array($visitor) || !is_int($visitor['id'] ?? null) || !is_array($visitor['post'] ?? null) || !is_array($visitor['meta'] ?? null)) { throw new RuntimeException('رکورد بازدیدکننده معتبر نیست.'); }
                $origin = $snapshot['source'] . ':' . $visitor['id'];
                $found = $wpdb->get_var($wpdb->prepare("SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key='_bc_portable_origin' AND meta_value=%s LIMIT 1", $origin));
                if ($wpdb->last_error) { throw new RuntimeException('بررسی بازدیدکننده قبلی انجام نشد.'); }
                if ($found) { continue; }
                $p = $visitor['post'];
                $post = array('post_type'=>'bargheto_visitor', 'post_author'=>get_current_user_id(), 'post_title'=>(string)($p['post_title'] ?? ''), 'post_status'=>in_array($p['post_status'] ?? '', array('private','publish','draft','trash'), true) ? $p['post_status'] : 'private',
                    'post_date'=>$p['post_date'] ?? '', 'post_date_gmt'=>$p['post_date_gmt'] ?? '', 'post_content'=>$p['post_content'] ?? '', 'post_excerpt'=>$p['post_excerpt'] ?? '');
                $id = wp_insert_post(wp_slash($post), true);
                if (is_wp_error($id) || !$id) { throw new RuntimeException('بازیابی بازدیدکننده انجام نشد.'); } $post_ids[] = $id;
                foreach ($visitor['meta'] as $key=>$values) {
                    if (!is_string($key) || $key === '_bc_portable_origin' || !is_array($values)) { throw new RuntimeException('داده تکمیلی بازدیدکننده معتبر نیست.'); }
                    foreach ($values as $value) { if (!add_post_meta($id, $key, wp_slash(bargheto_city_portable_rebase($value, $snapshot['origins'] ?? array())))) { throw new RuntimeException('بازیابی داده تکمیلی انجام نشد.'); } }
                }
                if (!add_post_meta($id, '_bc_portable_origin', $origin, true)) { throw new RuntimeException('ثبت شناسه انتقال بازدیدکننده انجام نشد.'); } $visitor_count++;
            }
        }
        $had_old = is_dir($location['root']);
        if ($had_old && !rename($location['root'], $backup)) { throw new RuntimeException('آماده‌سازی پوشه مقصد انجام نشد.'); }
        if (!rename($stage, $location['root'])) { if ($had_old) { rename($backup, $location['root']); } throw new RuntimeException('انتشار فایل‌ها انجام نشد.'); } $swapped = true;
        $receipt = array('id'=>$snapshot['id'], 'source'=>$snapshot['source'], 'restored_at'=>gmdate('c'), 'visitors'=>$visitor_count, 'files'=>count($snapshot['files']));
        if (!update_option('bargheto_city_portable_receipt', $receipt, false) || !update_option('bargheto_city_portable_source', wp_generate_uuid4(), false)) { throw new RuntimeException('ثبت پایان انتقال انجام نشد.'); }
        if ($wpdb->query('COMMIT') === false) { throw new RuntimeException('ثبت نهایی پایگاه داده انجام نشد.'); } $transaction = false;
        if ($had_old) { bargheto_city_media_remove_tree($backup); }
        delete_option('bargheto_city_portable_error');
        // The restored database is authoritative; do not leave private source records in public plugin files.
        bargheto_city_media_remove_tree($directory . '/portable-data');
        return $receipt;
    } catch (Throwable $e) {
        if ($transaction) { $wpdb->query('ROLLBACK'); }
        if ($swapped) { bargheto_city_media_remove_tree($location['root']); if ($had_old) { @rename($backup, $location['root']); } }
        bargheto_city_media_remove_tree($stage); throw $e;
    } finally {
        foreach ($keys as $key) { wp_cache_delete($key, 'options'); }
        wp_cache_delete('alloptions', 'options'); wp_cache_delete('notoptions', 'options');
        foreach ($post_ids as $id) { clean_post_cache($id); wp_cache_delete($id, 'post_meta'); }
    }
}
function bargheto_city_portable_activate() {
    if (!is_file(__DIR__ . '/portable-data/snapshot.php')) { return; }
    try { bargheto_city_portable_restore(false); }
    catch (Throwable $e) { update_option('bargheto_city_portable_error', $e->getMessage(), false); }
}
function bargheto_city_portable_restore_action() {
    if (!current_user_can('manage_options')) { wp_die('دسترسی کافی ندارید.', '', array('response'=>403)); }
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') { wp_die('درخواست معتبر نیست.', '', array('response'=>405)); }
    check_admin_referer('bargheto_city_portable_restore');
    if (($_POST['replace_city'] ?? '') !== '1') { wp_die('جایگزینی داده‌های شهر تأیید نشده است.'); }
    try { bargheto_city_portable_restore(true); bargheto_city_register_route(); flush_rewrite_rules(); }
    catch (Throwable $e) { update_option('bargheto_city_portable_error', $e->getMessage(), false); }
    wp_safe_redirect(add_query_arg(array('page'=>'bargheto-city'), admin_url('admin.php'))); exit;
}
add_action('admin_post_bargheto_city_portable_restore', 'bargheto_city_portable_restore_action');
function bargheto_city_portable_admin() {
    $pending = is_file(__DIR__ . '/portable-data/snapshot.php'); $error = get_option('bargheto_city_portable_error', ''); $receipt = get_option('bargheto_city_portable_receipt', array());
    ?>
    <section dir="rtl" style="max-width:760px;margin:24px 0;padding:20px;box-sizing:border-box;background:#fff;border:1px solid #c3c4c7;border-right:4px solid #22864c;border-radius:6px;">
        <h2 style="margin-top:0">خروجی کامل بازی برای انتقال به وردپرس دیگر</h2>
        <p>یک فایل ZIP قابل نصب شامل همین نسخه افزونه، همه مدل‌ها و رسانه‌های پوشه شهر، تنظیمات، چیدمان‌های ذخیره‌شده، وضعیت باتری و سوابق ورود کاربران دریافت کنید. روی وردپرس مقصد، ZIP را از «افزونه‌ها ← افزودن افزونه ← بارگذاری» نصب و فعال کنید؛ در مقصد بدون داده قبلی شهر، بازیابی خودکار انجام می‌شود.</p>
        <p><strong>پیش از خروجی، تغییرات ویرایشگر را با دکمه ذخیره ثبت کنید.</strong> تغییرات ذخیره‌نشده و تنظیمات شخصی مرورگر داخل خروجی نیستند. فایل خروجی شامل نام و موبایل ثبت‌شده بازدیدکنندگان و تنظیمات رله است؛ آن را خصوصی نگه دارید.</p>
        <p>دامنه و مسیر رسانه‌ها برای سرور جدید تنظیم می‌شوند. وردپرس، کاربران و رمزهای وردپرس، نشست‌های زنده و افزونه مستقل ساختمان برقتو داخل این بسته نیستند. اگر ساختمان جداگانه یا سرور TURN بیرونی استفاده می‌کنید، آن سرویس نیز باید در مقصد در دسترس باشد.</p>
        <?php if (!class_exists('ZipArchive')): ?><p style="color:#b32d2e">خروجی کامل نیازمند فعال بودن PHP ZipArchive روی هاست است.</p><?php endif; ?>
        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
            <input type="hidden" name="action" value="bargheto_city_portable_export">
            <?php wp_nonce_field('bargheto_city_portable_export'); submit_button('دانلود افزونه با تمام داده‌های فعلی بازی', 'primary', 'submit', true, class_exists('ZipArchive') ? array() : array('disabled'=>'disabled')); ?>
        </form>
        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
            <input type="hidden" name="action" value="bargheto_city_portable_export"><input type="hidden" name="media_mode" value="external">
            <?php wp_nonce_field('bargheto_city_portable_export'); submit_button('دانلود افزونه بدون فایل‌های سه‌بعدی و صدا', 'secondary', 'submit', true, class_exists('ZipArchive') ? array() : array('disabled'=>'disabled')); ?>
            <p>شامل کد، چیدمان‌ها و داده‌های فعلی بازی؛ رسانه‌ها روی سرور باقی می‌مانند. برای انتقال به سرور جدید، پوشه رسانه‌ها را جداگانه منتقل کنید.</p>
        </form>
        <p><small>برای انتقال، وردپرس ۶ یا جدیدتر، PHP ۷٫۴ یا جدیدتر، جداول InnoDB و فضای کافی برای ZIP و استخراج آن لازم است. محدودیت آپلود مقصد باید از حجم خروجی بیشتر باشد؛ مدل‌ها کیفیت اصلی خود را حفظ می‌کنند.</small></p>
        <?php if ($error): ?><div class="notice notice-error inline"><p><?php echo esc_html($error); ?></p></div><?php endif; ?>
        <?php if ($pending): ?>
            <h3>بسته انتقال در انتظار بازیابی</h3>
            <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
                <input type="hidden" name="action" value="bargheto_city_portable_restore">
                <?php wp_nonce_field('bargheto_city_portable_restore'); ?>
                <label><input type="checkbox" name="replace_city" value="1" required> مدل‌ها، تنظیمات و چیدمان شهر مقصد با بسته جایگزین شوند؛ سوابق ورود موجود حفظ و سوابق بسته اضافه شوند.</label>
                <?php submit_button('بازیابی بسته انتقال', 'secondary'); ?>
            </form>
        <?php elseif ($receipt): ?><p style="color:#196c3c">آخرین بسته انتقال با موفقیت بازیابی شد؛ <?php echo esc_html((string)($receipt['files'] ?? 0)); ?> فایل بررسی شد.</p><?php endif; ?>
    </section>
    <?php
}

function bargheto_city_portable_heavy109($path) {
    if (preg_match('/\.(glb|gltf|mp3|wav|ogg|m4a|aac|flac|mp4|webm|png|jpg|jpeg|webp|svg|gif|avif|ktx2|hdr)$/i', $path)) { return true; }
    // Omit durable uploads media from Light exports as well.
    if (strpos(str_replace('\\', '/', $path), 'assets/') === 0) {
        foreach (bargheto_city_server_manifest109() as $name => $spec) {
            if (basename($name) === basename($path)) { return true; }
        }
    }
    return false;
}
