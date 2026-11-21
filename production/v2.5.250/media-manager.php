<?php
/**
 * Bargheto City persistent server asset storage, independent of plugin updates.
 * Assets live at wp-content/uploads/bargheto-city/assets/{models,audio}.
 */
if (!defined('ABSPATH')) { exit; }

/** Verified original media, with the optimized high-voltage transformer in V2.5.11. */
function bargheto_city_media_manifest() {
    return array(
        'models/bldc-motor.glb' => array('size' => 459732, 'sha256' => '0508da373663eab69a4c530fec2fe3162a99b1cdb9e0e92efd21ff9db72cabab'),
        'audio/cinematic-from-107s.mp3' => array('size' => 1213901, 'sha256' => 'bbea79c168fad4ea3f3497aed644fa7709ce089cef76ab9033a0feec4fc6b8f9'),
        'models/cooling_tower_background.glb' => array('size' => 2960636, 'sha256' => '2d968fa4d6aede2e458edbe6af9d8cea0d60b702c0100f821f0ba9cc6422f1b7'),
        'models/factory-electric-box.glb' => array('size' => 2705496, 'sha256' => 'f2fa51bb827d5080c331480b7f8952a3df650d33f958d932d025a193b24159e4'),
        'models/power-transformer.glb' => array('size' => 1795888, 'sha256' => 'f2d54eb653751b0e5c42e0295827d9261d3ef47ded4f452a614e4b38de93cf9b'),
        'models/roof-solar-panel.glb' => array('size' => 576940, 'sha256' => 'd665eaad44ee55125efff0c97cfab8a654a2559201bfe85c89856e0b42a11b8b'),
        'models/rooftop-cooler.glb' => array('size' => 4685568, 'sha256' => '405db917a9421a51c7b83308b9b65d3acabc3061fe6263dfe41b385c189bf46f'),
        'models/victorian-factory.glb' => array('size' => 2916908, 'sha256' => '7148ad4a59d1afe48a31b1d17721f8d8ae514107827cc6022665540cb3604c75'),
    );
}

function bargheto_city_media_location() {
    $uploads = wp_upload_dir();
    if (!empty($uploads['error'])) {
        return new WP_Error('uploads_error', $uploads['error']);
    }
    return array(
        'root' => trailingslashit($uploads['basedir']) . 'bargheto-city',
        'path' => trailingslashit($uploads['basedir']) . 'bargheto-city/assets',
        'url' => trailingslashit($uploads['baseurl']) . 'bargheto-city/assets/',
    );
}

function bargheto_city_media_status($verify_hash = false) {
    if (function_exists('bargheto_city_repair_missing221')) { bargheto_city_repair_missing221(); }
    $location = bargheto_city_media_location();
    $expected = bargheto_city_media_manifest();
    $repair_report221 = get_option('bargheto_city_media_report221', array());
    $status = array('location' => $location, 'missing' => array(), 'urls' => array(), 'installed' => 0, 'total' => count($expected));
    if (is_wp_error($location)) {
        $status['missing'] = array_keys($expected);
        return $status;
    }
    foreach ($expected as $relative => $spec) {
        $local = $location['path'] . '/' . $relative;
        // Size also detects partially copied files; compare SHA-256 at import time.
        if (!is_file($local) || filesize($local) !== $spec['size']) {
            $status['missing'][] = $relative;
            continue;
        }
        if ($verify_hash) {
            $actual = hash_file('sha256', $local);
            if (!is_string($actual) || !hash_equals($spec['sha256'], $actual)) {
                $status['missing'][] = $relative;
                continue;
            }
        }
        if (isset($repair_report221['errors'][$relative]) && function_exists('bargheto_city_media_matches211')
            && !bargheto_city_media_matches211($local, $spec)) {
            $status['missing'][] = $relative;
            continue;
        }
        $status['installed']++;
        $name = basename($relative);
        $status['urls'][$name] = $location['url'] . $relative . '?v=2.5.11' . (function_exists('bargheto_city_media_cache_suffix221')?bargheto_city_media_cache_suffix221($relative):'');
    }
    return $status;
}

/** Files are served statically; IIS requires a .glb MIME mapping. */
function bargheto_city_media_iis_config() {
    return '<?xml version="1.0" encoding="UTF-8"?>' . "\n"
      . '<configuration><system.webServer><staticContent>'
      . '<remove fileExtension=".glb" /><mimeMap fileExtension=".glb" mimeType="model/gltf-binary" />'
      . '<remove fileExtension=".mp3" /><mimeMap fileExtension=".mp3" mimeType="audio/mpeg" />'
      . '<remove fileExtension=".png" /><mimeMap fileExtension=".png" mimeType="image/png" />'
      . '<remove fileExtension=".webp" /><mimeMap fileExtension=".webp" mimeType="image/webp" />'
      . '<remove fileExtension=".svg" /><mimeMap fileExtension=".svg" mimeType="image/svg+xml" />'
      . '<remove fileExtension=".jpg" /><mimeMap fileExtension=".jpg" mimeType="image/jpeg" />'
      . '<remove fileExtension=".jpeg" /><mimeMap fileExtension=".jpeg" mimeType="image/jpeg" />'
      . '<remove fileExtension=".mp4" /><mimeMap fileExtension=".mp4" mimeType="video/mp4" />'
      . '<remove fileExtension=".wav" /><mimeMap fileExtension=".wav" mimeType="audio/wav" />'
      . '<remove fileExtension=".ogg" /><mimeMap fileExtension=".ogg" mimeType="audio/ogg" />'
      . '</staticContent></system.webServer></configuration>' . "\n";
}

function bargheto_city_media_remove_tree($directory) {
    // Called ONLY on the dedicated temporary/backup directories this importer made.
    if (!is_dir($directory) || is_link($directory)) { return; }
    $items = scandir($directory);
    if (!is_array($items)) { return; }
    foreach ($items as $item) {
        if ($item === '.' || $item === '..') { continue; }
        $path = $directory . '/' . $item;
        if (is_dir($path) && !is_link($path)) { bargheto_city_media_remove_tree($path); }
        else { @unlink($path); }
    }
    @rmdir($directory);
}

/** Install a verified separate media ZIP through WordPress admin; never touches game code. */
function bargheto_city_upload_server_media() {
    if (!current_user_can('manage_options')) { wp_die('Access denied.', '', array('response' => 403)); }
    check_admin_referer('bargheto_city_import_media');
    if (empty($_FILES['bargheto_city_media_zip']) || !is_array($_FILES['bargheto_city_media_zip'])) {
        wp_die('No server asset ZIP was selected.');
    }
    $file = $_FILES['bargheto_city_media_zip'];
    if (!isset($file['error']) || $file['error'] !== UPLOAD_ERR_OK || !isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
        wp_die('Upload failed. Check post_max_size, upload_max_filesize and server permissions.');
    }
    if ((int) $file['size'] > 45 * 1024 * 1024 || (int) $file['size'] < 1000) {
        wp_die('Invalid media ZIP size.');
    }
    $location = bargheto_city_media_location();
    if (is_wp_error($location)) { wp_die(esc_html($location->get_error_message())); }
    if (!wp_mkdir_p($location['root']) || !is_writable($location['root'])) {
        wp_die('WordPress uploads/bargheto-city is not writable.');
    }
    $expected = bargheto_city_media_manifest();
    $seen = array();
    $allowed_aux = array('models/bargheto-avatar.glb' => true, 'manifest.json' => true, 'README-FA.txt' => true, 'web.config' => true);
    $native = class_exists('ZipArchive');
    if ($native) {
        $zip = new ZipArchive();
        if ($zip->open($file['tmp_name']) !== true) { wp_die('The file is not a readable ZIP archive.'); }
        $entries = array();
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $stat = $zip->statIndex($i);
            if (!$stat) { $zip->close(); wp_die('Unreadable ZIP entry.'); }
            $entries[] = array('name' => $stat['name'], 'size' => $stat['size']);
        }
    } else {
        // WordPress bundles PclZip, so the admin importer also works on PHP without ext-zip.
        require_once ABSPATH . 'wp-admin/includes/class-pclzip.php';
        $zip = new PclZip($file['tmp_name']);
        $content = $zip->listContent();
        if (!is_array($content)) { wp_die('Unreadable ZIP archive (PclZip).'); }
        $entries = array();
        foreach ($content as $entry) {
            $entries[] = array('name' => $entry['filename'], 'size' => $entry['size']);
        }
    }
    // Deny ZIP-slip paths, duplicates, unrecognized content and oversized decoded files.
    foreach ($entries as $entry) {
        $name = $entry['name'];
        if (!is_string($name) || isset($seen[$name]) || strpos($name, chr(92)) !== false || strpos($name, '..') !== false || strpos($name, '/') === 0) {
            if ($native) { $zip->close(); }
            wp_die('Unsafe or duplicate ZIP filename.');
        }
        $seen[$name] = true;
        if (!isset($expected[$name]) && !isset($allowed_aux[$name]) && $name !== 'models/' && $name !== 'audio/') {
            if ($native) { $zip->close(); }
            wp_die('Unexpected entry in ZIP: ' . esc_html($name));
        }
        if (isset($expected[$name]) && (int) $entry['size'] !== $expected[$name]['size']) {
            if ($native) { $zip->close(); }
            wp_die('Wrong uncompressed asset size for: ' . esc_html($name));
        }
    }
    foreach ($expected as $relative => $spec) {
        if (!isset($seen[$relative])) {
            if ($native) { $zip->close(); }
            wp_die('ZIP is missing: ' . esc_html($relative));
        }
    }
    $suffix = str_replace('-', '', wp_generate_uuid4());
    $stage = $location['root'] . '/.assets-import-' . $suffix;
    $backup = $location['root'] . '/.assets-backup-' . $suffix;
    if (!wp_mkdir_p($stage . '/models') || !wp_mkdir_p($stage . '/audio')) {
        if ($native) { $zip->close(); } wp_die('Cannot prepare upload directory.');
    }
    $error = '';
    if ($native) {
        foreach ($expected as $relative => $spec) {
            $stream = $zip->getStream($relative);
            $target = $stage . '/' . $relative;
            $sink = @fopen($target, 'wb');
            if (!$stream || !$sink) {
                if (is_resource($stream)) { fclose($stream); }
                if (is_resource($sink)) { fclose($sink); }
                $error = 'Cannot extract ' . $relative; break;
            }
            $copied = stream_copy_to_stream($stream, $sink, $spec['size'] + 1);
            fclose($stream);
            fclose($sink);
            if ($copied !== $spec['size']) { $error = 'Wrong decoded size for ' . $relative; break; }
        }
        $zip->close();
    } else {
        // Extract ONLY the allowlisted current media assets, never arbitrary ZIP content.
        $extracted = $zip->extract(PCLZIP_OPT_PATH, $stage, PCLZIP_OPT_BY_NAME, array_keys($expected));
        if (!is_array($extracted) || count($extracted) !== count($expected)) {
            $error = 'Cannot extract all media assets using PclZip.';
        }
    }
    if (!$error) {
        foreach ($expected as $relative => $spec) {
            $target = $stage . '/' . $relative;
            $hash = is_file($target) ? hash_file('sha256', $target) : false;
            if (!is_file($target) || filesize($target) !== $spec['size'] || !is_string($hash) || !hash_equals($spec['sha256'], $hash)) {
                $error = 'Checksum or size validation failed for ' . $relative; break;
            }
        }
    }
    if (!$error && file_put_contents($stage . '/web.config', bargheto_city_media_iis_config()) === false) {
        $error = 'Cannot write IIS media MIME configuration.';
    }
    // Keep a machine-readable copy beside the media.
    if (!$error && file_put_contents($stage . '/manifest.json', wp_json_encode(array('version' => '2.5.11', 'files' => $expected), JSON_PRETTY_PRINT)) === false) {
        $error = 'Cannot save manifest.';
    }
    if ($error) { bargheto_city_media_remove_tree($stage); wp_die(esc_html($error)); }
    // Directory swap: do not leave the public directory half-copied.
    // Preserve files outside the base package (new media and custom server files).
    foreach(bargheto_city_portable_files($location['path']) as $relative=>$source){
        if(isset($expected[$relative])||in_array($relative,array('manifest.json','web.config'),true))continue;
        $dest=$stage.'/'.$relative;
        if(!wp_mkdir_p(dirname($dest))||!copy($source,$dest)){bargheto_city_media_remove_tree($stage);wp_die('Cannot preserve existing server media.');}
    }
    $has_old = is_dir($location['path']);
    if ($has_old && !@rename($location['path'], $backup)) {
        bargheto_city_media_remove_tree($stage);
        wp_die('Cannot move existing assets. Check server filesystem permissions.');
    }
    if (!@rename($stage, $location['path'])) {
        if ($has_old) { @rename($backup, $location['path']); }
        bargheto_city_media_remove_tree($stage);
        wp_die('Cannot publish media. Previous assets were restored where possible.');
    }
    if ($has_old) { bargheto_city_media_remove_tree($backup); }
    update_option('bargheto_city_installed_media_version', '2.5.9', false);
    wp_safe_redirect(add_query_arg(array('page' => 'bargheto-city', 'assets_installed' => '1'), admin_url('admin.php')));
    exit;
}
add_action('admin_post_bargheto_city_upload_server_media', 'bargheto_city_upload_server_media');
