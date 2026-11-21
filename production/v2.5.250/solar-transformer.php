<?php
/** Optional transformer model, stored independently of the original server-media pack. */
if (!defined('ABSPATH')) { exit; }
function bargheto_city_solar_spec() {
    return array('filename' => 'solar-substation-transformer.glb', 'size' => 1268164, 'sha256' => '0cfdc8393037bb28099acba015824857636399219931e78ae81887161f1f2fb4');
}
function bargheto_city_solar_location() {
    $uploads = wp_upload_dir();
    if (!empty($uploads['error'])) { return new WP_Error('uploads_error', $uploads['error']); }
    return array('path' => trailingslashit($uploads['basedir']) . 'bargheto-city/custom-models', 'url' => trailingslashit($uploads['baseurl']) . 'bargheto-city/custom-models/');
}
function bargheto_city_solar_valid($path) {
    $spec = bargheto_city_solar_spec();
    clearstatcache(true, $path);
    if (!is_readable($path) || filesize($path) !== $spec['size']) { return false; }
    $handle = fopen($path, 'rb');
    if (!$handle) { return false; }
    $header = fread($handle, 12); fclose($handle);
    if (strlen($header) !== 12 || substr($header, 0, 4) !== 'glTF') { return false; }
    $values = unpack('Vversion/Vlength', substr($header, 4));
    return $values['version'] === 2 && $values['length'] === $spec['size'] && hash_equals($spec['sha256'], hash_file('sha256', $path));
}
function bargheto_city_solar_url() {
    $location = bargheto_city_solar_location(); $spec = bargheto_city_solar_spec();
    $bundled = plugin_dir_path(__FILE__) . 'game/models/' . $spec['filename'];
    if (bargheto_city_solar_valid($bundled)) {
        return plugins_url('game/models/' . $spec['filename'], __FILE__) . '?v=' . substr($spec['sha256'], 0, 16);
    }
    if (is_wp_error($location) || !bargheto_city_solar_valid($location['path'] . '/' . $spec['filename'])) { return null; }
    return $location['url'] . $spec['filename'] . '?v=' . substr($spec['sha256'], 0, 16);
}
function bargheto_city_upload_solar_transformer() {
    if (!current_user_can('manage_options')) { wp_die('Not permitted.'); }
    check_admin_referer('bargheto_city_upload_solar_transformer');
    $file = isset($_FILES['solar_transformer']) ? $_FILES['solar_transformer'] : array();
    if (!isset($file['error'], $file['tmp_name']) || $file['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name'])) { wp_die('بارگذاری انجام نشد. محدودیت حجم آپلود را بررسی کنید.'); }
    if (!bargheto_city_solar_valid($file['tmp_name'])) { wp_die('این فایل با مدل ترانس جدید مطابقت ندارد. فایل GLB همین نسخه را انتخاب کنید.'); }
    $location = bargheto_city_solar_location(); $spec = bargheto_city_solar_spec();
    if (is_wp_error($location) || !wp_mkdir_p($location['path'])) { wp_die('پوشه مدل ترانس قابل نوشتن نیست.'); }
    // Keep the optional file outside assets/: importing the original media ZIP cannot delete it.
    $config = bargheto_city_media_iis_config();
    if (file_put_contents($location['path'] . '/web.config', $config, LOCK_EX) === false) { wp_die('ثبت تنظیمات فایل GLB انجام نشد.'); }
    $stage = tempnam($location['path'], 'transformer-');
    if ($stage === false) { wp_die('ساخت فایل موقت انجام نشد.'); }
    if (!move_uploaded_file($file['tmp_name'], $stage)) { @unlink($stage); wp_die('انتقال فایل انجام نشد.'); }
    if (!bargheto_city_solar_valid($stage)) { @unlink($stage); wp_die('فایل بارگذاری شده ناقص است.'); }
    if (!@rename($stage, $location['path'] . '/' . $spec['filename'])) { @unlink($stage); wp_die('نصب مدل انجام نشد؛ مدل قبلی حفظ شد.'); }
    @chmod($location['path'] . '/' . $spec['filename'], 0644);
    wp_safe_redirect(add_query_arg(array('page' => 'bargheto-city', 'solar_installed' => '1'), admin_url('admin.php'))); exit;
}
add_action('admin_post_bargheto_city_upload_solar_transformer', 'bargheto_city_upload_solar_transformer');
function bargheto_city_solar_admin() {
    $ready = bargheto_city_solar_url() !== null;
    ?>
    <h2>ترانس منتقل‌شده به نیروگاه شهید جعفری</h2>
    <p><?php echo $ready ? 'مدل نصب و صحت فایل تأیید شده است؛ در نسخه ۲.۵.۲۹ در پست اصلی شهید جعفری نمایش داده می‌شود.' : 'برای نمایش ترانس جدید، فایل GLB همراه نسخه V2.5.25 را یک بار بارگذاری کنید. بازی بدون این مدل اجرا می‌شود، اما محل ترانس اصلی شهید جعفری خالی می‌ماند.'; ?></p>
    <p>فایل‌های GLB و صوتی قبلی را دوباره بارگذاری نکنید. مدل جدید با به‌روزرسانی افزونه یا نصب مجدد بسته فایل‌های قبلی حذف نمی‌شود.</p>
    <form method="post" enctype="multipart/form-data" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
        <input type="hidden" name="action" value="bargheto_city_upload_solar_transformer">
        <?php wp_nonce_field('bargheto_city_upload_solar_transformer'); ?>
        <input type="file" name="solar_transformer" accept=".glb,model/gltf-binary" required>
        <?php submit_button($ready ? 'نصب مجدد مدل ترانس' : 'بارگذاری مدل ترانس جدید'); ?>
    </form>
    <?php
}
