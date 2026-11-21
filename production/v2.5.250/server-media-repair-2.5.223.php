<?php
/** Verified media repair and durable recovery, independent of plugin upgrades. */
if (!defined('ABSPATH')) { exit; }

function bargheto_city_install_manifest211() {
    $server = bargheto_city_server_manifest109();
    if (!$server || !is_array($server)) { throw new RuntimeException('فهرست رسانه‌های بسته معتبر نیست.'); }
    $manifest = array_merge(bargheto_city_media_manifest(), $server);
    foreach ($manifest as $name => $spec) {
        if (!preg_match('~\A(?:models|audio|bundled|office)/[A-Za-z0-9_.-]+\.(?:glb|gltf|mp3|wav|ogg|m4a|aac|flac|mp4|webm|png|jpg|jpeg|webp|svg|gif|avif|ktx2|hdr)\z~D', $name)
            || !isset($spec['size'], $spec['sha256']) || !is_int($spec['size']) || $spec['size'] < 1
            || !preg_match('/\A[a-f0-9]{64}\z/D', $spec['sha256'])) {
            throw new RuntimeException('مشخصات رسانه معتبر نیست: ' . basename($name));
        }
    }
    return $manifest;
}

function bargheto_city_media_matches211($file, $spec) {
    clearstatcache(true, $file);
    if (!is_file($file) || is_link($file) || !is_readable($file) || filesize($file) !== $spec['size']) { return false; }
    $actual = @hash_file('sha256', $file);
    return is_string($actual) && hash_equals($spec['sha256'], $actual);
}

function bargheto_city_recovery_path221($loc, $spec) {
    return $loc['root'] . '/.media-recovery/' . $spec['sha256'] . '.bin';
}

/** Change only repaired media URLs, so browsers cannot reuse an earlier corrupt response. */
function bargheto_city_media_cache_suffix221($name) {
    $revisions=get_option('bargheto_city_media_revisions221',array());
    $revision=is_array($revisions)?max(0,(int)($revisions[$name]??0)):0;
    return $revision>0 ? '&repair=' . $revision : '';
}

/** Verify before publication, and support Windows replacement semantics. */
function bargheto_city_media_publish221($source, $target, $spec, $quarantine = '') {
    if (bargheto_city_media_matches211($target, $spec)) { return; }
    if (is_dir($target) || is_link($target)) { throw new RuntimeException('مسیر مقصد فایل رسانه معتبر نیست.'); }
    if (!wp_mkdir_p(dirname($target))) { throw new RuntimeException('پوشهٔ مقصد رسانه قابل نوشتن نیست.'); }
    $temp = dirname($target) . '/.media-publish-' . wp_generate_uuid4() . '.tmp';
    $previous = '';
    try {
        if (!@copy($source, $temp) || !bargheto_city_media_matches211($temp, $spec)) { throw new RuntimeException('کپی یا تأیید رسانه کامل نشد.'); }
        if (is_file($target) && $quarantine !== '') {
            if (!wp_mkdir_p($quarantine)) { throw new RuntimeException('نگهداری نسخهٔ قبلی رسانه ممکن نیست.'); }
            $preserved = $quarantine . '/' . basename($target) . '-' . wp_generate_uuid4() . '.bin';
            $old_size = filesize($target); $old_hash = @hash_file('sha256', $target);
            if (!is_string($old_hash) || !@copy($target, $preserved)
                || !bargheto_city_media_matches211($preserved, array('size'=>$old_size, 'sha256'=>$old_hash))) {
                throw new RuntimeException('نسخهٔ قبلی رسانه نگهداری نشد؛ فایل اصلی تغییر نکرد.');
            }
        }
        if (!@rename($temp, $target)) {
            if (!is_file($target)) { throw new RuntimeException('انتشار فایل رسانه انجام نشد.'); }
            $previous = $temp . '.previous';
            if (!@rename($target, $previous)) { throw new RuntimeException('آماده‌سازی جایگزینی رسانه انجام نشد.'); }
            if (!@rename($temp, $target)) {
                if (!@rename($previous, $target)) { throw new RuntimeException('انتقال متوقف شد؛ نسخهٔ قبلی در ' . basename($previous) . ' نگهداری شده است.'); }
                $previous = ''; throw new RuntimeException('انتشار رسانه انجام نشد؛ نسخهٔ قبلی حفظ شد.');
            }
        }
        @chmod($target, 0644);
        if (!bargheto_city_media_matches211($target, $spec)) { throw new RuntimeException('رسانهٔ منتشرشده تأیید نشد.'); }
        if ($previous !== '') { @unlink($previous); $previous = ''; }
    } finally {
        if (is_file($temp)) { @unlink($temp); }
        // Failed rollback files remain available; cleanup never deletes them.
    }
}

function bargheto_city_media_sources221($loc, $name, $spec) {
    $sources = array(
        bargheto_city_recovery_path221($loc, $spec),
        __DIR__ . '/media-seeds/' . $name,
        __DIR__ . '/game/dist/assets/' . basename($name),
        __DIR__ . '/office/assets/' . basename($name),
        __DIR__ . '/portable-data/uploads/assets/' . $name,
        $loc['root'] . '/' . $name,
    );
    foreach (array('/.assets-import-*/backup/', '/.assets-backup-*/') as $pattern) {
        $matches = glob($loc['root'] . $pattern . $name);
        if (is_array($matches)) { foreach (array_slice($matches, 0, 64) as $file) { $sources[] = $file; } }
    }
    return array_unique($sources);
}

function bargheto_city_media_fingerprint221($manifest, $loc) {
    $parts = array($loc['path'], hash('sha256', wp_json_encode($manifest)));
    foreach ($manifest as $name => $spec) {
        foreach (array($loc['path'] . '/' . $name, bargheto_city_recovery_path221($loc, $spec)) as $file) {
            clearstatcache(true, $file);
            $parts[] = is_file($file) ? array(filesize($file), filemtime($file), filectime($file), fileinode($file)) : null;
        }
    }
    return hash('sha256', wp_json_encode($parts));
}

/** Independent repair: one unavailable file never blocks all other media. */
function bargheto_city_install_bundled211($only = null) {
    $report = array('checked'=>0, 'valid'=>array(), 'restored'=>array(), 'cached'=>0, 'errors'=>array(), 'warnings'=>array(), 'busy'=>false);
    $loc = bargheto_city_media_location();
    if (is_wp_error($loc)) { $report['errors']['storage'] = $loc->get_error_message(); }
    try { $all = bargheto_city_install_manifest211(); }
    catch (Throwable $e) { $report['errors']['manifest'] = $e->getMessage(); $all = array(); }
    if ($report['errors']) { update_option('bargheto_city_media_error211', implode('؛ ', $report['errors']), false); return $report; }
    $manifest = $only === null ? $all : array_intersect_key($all, array_fill_keys($only, true));
    if (!wp_mkdir_p($loc['root']) || !wp_mkdir_p($loc['path'])) {
        $report['errors']['storage'] = 'پوشهٔ رسانه‌های سرور قابل نوشتن نیست.';
        update_option('bargheto_city_media_error211', $report['errors']['storage'], false); return $report;
    }
    $lock = @fopen($loc['root'] . '/.media-repair.lock', 'c');
    if (!$lock) { $report['errors']['lock'] = 'فضای هماهنگی بازیابی رسانه قابل نوشتن نیست.'; }
    elseif (!flock($lock, LOCK_EX | LOCK_NB)) { fclose($lock); $report['busy'] = true; return $report; }
    if ($report['errors']) { update_option('bargheto_city_media_error211', implode('؛ ', $report['errors']), false); return $report; }
    try {
        $recovery = $loc['root'] . '/.media-recovery';
        $revisions=get_option('bargheto_city_media_revisions221',array());
        if(!is_array($revisions))$revisions=array();
        if (wp_mkdir_p($recovery)) {
            foreach (array('index.php'=>"<?php exit;\n", '.htaccess'=>"Require all denied\n", 'web.config'=>'<?xml version="1.0"?><configuration><system.webServer><security><authorization><clear/><add accessType="Deny" users="*"/></authorization></security></system.webServer></configuration>') as $name=>$content) {
                $file = $recovery . '/' . $name;
                if (!is_file($file)) { @file_put_contents($file, $content, LOCK_EX); }
            }
        }
        foreach ($manifest as $name => $spec) {
            $report['checked']++; $target = $loc['path'] . '/' . $name;
            try {
                $valid = bargheto_city_media_matches211($target, $spec);
                $source = $valid ? $target : '';
                if (!$valid) {
                    foreach (bargheto_city_media_sources221($loc, $name, $spec) as $candidate) {
                        if (bargheto_city_media_matches211($candidate, $spec)) { $source = $candidate; break; }
                    }
                    if ($source === '') { throw new RuntimeException('این فایل هنوز روی سرور نصب نشده است؛ بستهٔ رسانه‌های 2.5.223 را از بخش بارگذاری رسانه‌ها نصب کنید.'); }
                    bargheto_city_media_publish221($source, $target, $spec, $recovery . '/quarantine');
                    $report['restored'][] = $name;
                    $revisions[$name]=max(0,(int)($revisions[$name]??0))+1;
                } else { $report['valid'][] = $name; }
                try {
                    bargheto_city_media_publish221($target, bargheto_city_recovery_path221($loc, $spec), $spec);
                    $report['cached']++;
                } catch (Throwable $e) { $report['warnings'][$name] = $e->getMessage(); }
            } catch (Throwable $e) { $report['errors'][$name] = $e->getMessage(); }
        }
        $config = $loc['path'] . '/web.config';
        if ($report['restored']) { update_option('bargheto_city_media_revisions221',$revisions,false); }
        if (!is_file($config) && @file_put_contents($config, bargheto_city_media_iis_config(), LOCK_EX) === false) { $report['warnings']['MIME'] = 'تنظیم MIME قابل نوشتن نیست.'; }
        if ($only === null) {
            update_option('bargheto_city_media_report221', $report, false);
            if (!$report['errors'] && !$report['warnings']) {
                update_option('bargheto_city_media_receipt221', array('checked_at'=>time(), 'fingerprint'=>bargheto_city_media_fingerprint221($all, $loc)), false);
            } else { delete_option('bargheto_city_media_receipt221'); }
        }
        if ($report['errors']) {
            $items = array(); foreach ($report['errors'] as $name=>$message) { $items[] = basename($name) . ': ' . $message; }
            update_option('bargheto_city_media_error211', implode('؛ ', $items), false);
        } elseif ($only === null) { delete_option('bargheto_city_media_error211'); }
    } finally { flock($lock, LOCK_UN); fclose($lock); }
    return $report;
}

/** Repair before public URLs; unchanged pages use metadata rather than rehashing all media. */
function bargheto_city_repair_missing221() {
    static $checked = false;
    if ($checked) { return; } $checked = true;
    $loc = bargheto_city_media_location(); if (is_wp_error($loc)) { return; }
    try { $manifest = bargheto_city_install_manifest211(); } catch (Throwable $e) { return; }
    $missing = array();
    foreach ($manifest as $name=>$spec) {
        $file=$loc['path'].'/'.$name; clearstatcache(true,$file);
        if (!is_file($file) || filesize($file) !== $spec['size']) { $missing[] = $name; }
    }
    $receipt=get_option('bargheto_city_media_receipt221',array());
    if ($missing || empty($receipt['checked_at']) || $receipt['checked_at'] < time()-3600
        || ($receipt['fingerprint'] ?? '') !== bargheto_city_media_fingerprint221($manifest,$loc)) {
        bargheto_city_install_bundled211();
    }
}

function bargheto_city_admin_install_bundled211() {
    // Upload chunks and install steps must not rehash all existing media in admin_init.
    if (in_array($_REQUEST['action']??'',array('bargheto_city_media225','bargheto_city_upload_extra_media109'),true)) { return; }
    if (!current_user_can('manage_options')) { return; }
    $loc = bargheto_city_media_location(); if (is_wp_error($loc)) { bargheto_city_install_bundled211(); return; }
    try { $manifest = bargheto_city_install_manifest211(); } catch (Throwable $e) { bargheto_city_install_bundled211(); return; }
    $receipt = get_option('bargheto_city_media_receipt221', array());
    // Integrity check after a change or every five minutes, not every heartbeat.
    if (!empty($receipt['checked_at']) && $receipt['checked_at'] > time()-300
        && ($receipt['fingerprint'] ?? '') === bargheto_city_media_fingerprint221($manifest, $loc)) { return; }
    bargheto_city_install_bundled211();
}
add_action('admin_init', 'bargheto_city_admin_install_bundled211');

function bargheto_city_repair_media_action221() {
    if (!current_user_can('manage_options')) { wp_die('دسترسی کافی نیست.', '', array('response'=>403)); }
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') { wp_die('درخواست معتبر نیست.', '', array('response'=>405)); }
    check_admin_referer('bargheto_city_repair_media221'); wp_raise_memory_limit('admin'); @set_time_limit(120);
    bargheto_city_install_bundled211();
    wp_safe_redirect(add_query_arg(array('page'=>'bargheto-city'), admin_url('admin.php'))); exit;
}
add_action('admin_post_bargheto_city_repair_media221', 'bargheto_city_repair_media_action221');

function bargheto_city_media_notice211() {
    if (!current_user_can('manage_options')) { return; }
    $error = get_option('bargheto_city_media_error211', '');
    if ($error) { echo '<div class="notice notice-error"><p dir="rtl">' . esc_html($error) . '</p></div>'; }
}
add_action('admin_notices', 'bargheto_city_media_notice211');

function bargheto_city_media_status211() {
    if (!current_user_can('manage_options')) { return; }
    $loc=bargheto_city_media_location(); $ready=!is_wp_error($loc); $total=0; $present=0;
    try {
        $manifest=bargheto_city_install_manifest211(); $total=count($manifest);
        if ($ready) { foreach ($manifest as $name=>$spec) { $file=$loc['path'].'/'.$name; clearstatcache(true,$file); if (is_file($file)&&filesize($file)===$spec['size']) { $present++; } } }
        $ready=$ready&&$present===$total&&!get_option('bargheto_city_media_error211','');
    } catch (Throwable $e) { $ready=false; }
    $report=get_option('bargheto_city_media_report221',array()); $warnings=!empty($report['warnings']);
    echo '<div class="notice ' . ($ready&&!$warnings?'notice-success':'notice-warning') . ' inline"><p dir="rtl">';
    echo esc_html($ready ? 'رسانه‌های سرور آماده‌اند (' . $present . ' از ' . $total . '). فایل‌های سالم حفظ شده‌اند و بازیابی از بسته یا کپی پایدار انجام می‌شود.' : 'آماده‌سازی رسانه‌ها کامل نشده است (' . $present . ' از ' . $total . '). جزئیات فایل‌های باقی‌مانده در پیام بالا نمایش داده می‌شود؛ بقیهٔ فایل‌ها مستقل بازیابی می‌شوند.');
    if ($warnings) { echo '<br>' . esc_html('برخی کپی‌های بازیابی یا تنظیمات ذخیره نشدند؛ دسترسی نوشتن پوشهٔ بارگذاری را بررسی کنید.'); }
    echo '</p></div><form method="post" action="' . esc_url(admin_url('admin-post.php')) . '"><input type="hidden" name="action" value="bargheto_city_repair_media221">';
    wp_nonce_field('bargheto_city_repair_media221'); submit_button('بررسی کامل و تعمیر رسانه‌ها','secondary'); echo '</form>';
}
