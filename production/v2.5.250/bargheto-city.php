<?php
/**
 * Plugin Name: شهر هوشمند انرژی برقتو
 * Plugin URI: https://www.bodara.ir/barghetocity
 * Description: Shared 3D city with WebRTC voice, live players, guest/admin roles and mobile joystick.
 * Version: 2.5.250
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Author: Bargheto
 * Text Domain: bargheto-city
 */

if (!defined('ABSPATH')) {
    exit;
}

require_once __DIR__ . '/visitors.php';
require_once __DIR__ . '/media-manager.php';
require_once __DIR__ . '/server-media.php';
require_once __DIR__ . '/server-media-install.php';
require_once __DIR__ . '/moderation.php';
require_once __DIR__ . '/browser-cache.php';
require_once __DIR__ . '/solar-transformer.php';
require_once __DIR__ . '/industrial-assets.php';
require_once __DIR__ . '/multiplayer.php';
require_once __DIR__ . '/layout-editor.php';
require_once __DIR__ . '/portable-export.php';
require_once __DIR__ . '/office-guide.php';
require_once __DIR__ . '/office-editor.php';
require_once __DIR__ . '/office-interior.php';

/** The public route works with or without a trailing slash. */
function bargheto_city_register_route() {
    add_rewrite_rule('^barghetocity/?$', 'index.php?bargheto_city=1', 'top');
}
add_action('init', 'bargheto_city_register_route');

function bargheto_city_query_vars($vars) {
    $vars[] = 'bargheto_city';
    return $vars;
}
add_filter('query_vars', 'bargheto_city_query_vars');

function bargheto_city_activate() {
    bargheto_city_portable_activate();
    bargheto_city_install_bundled211();
    bargheto_city_register_route();
    flush_rewrite_rules();
}
register_activation_hook(__FILE__, 'bargheto_city_activate');

function bargheto_city_deactivate() {
    flush_rewrite_rules();
}
register_deactivation_hook(__FILE__, 'bargheto_city_deactivate');

/**
 * Return the built Vite HTML with plugin asset URLs remapped.
 * No runtime string patches; source and distributed build match.
 */
function bargheto_city_html() {
    $html_file = plugin_dir_path(__FILE__) . 'game/dist/index.html';
    if (!is_readable($html_file)) {
        return null;
    }

    $html = file_get_contents($html_file);
    if ($html === false) {
        return null;
    }

    $asset_url148 = plugins_url('game/dist/assets', __FILE__);
    $asset_host148 = wp_parse_url($asset_url148, PHP_URL_HOST);
    $site_host148 = wp_parse_url(home_url('/'), PHP_URL_HOST);
    // Own-site assets must use the document origin, including www aliases.
    // Preserve explicitly configured external asset hosts/CDNs.
    $same_host148 = $asset_host148 && $site_host148 &&
        strtolower(preg_replace('/^www\./i', '', $asset_host148)) === strtolower(preg_replace('/^www\./i', '', $site_host148));
    $asset_base = trailingslashit($same_host148 ? wp_make_link_relative($asset_url148) : $asset_url148);
    // Support relative and root-absolute builds, including touch controls.
    // Remap only document asset URLs for the plugin installation path.
    $html = str_replace(
        array('src="/assets/', 'href="/assets/', "src='/assets/", "href='/assets/", 'src="./assets/', 'href="./assets/', "src='./assets/", "href='./assets/"),
        array('src="' . esc_url($asset_base), 'href="' . esc_url($asset_base), "src='" . esc_url($asset_base), "href='" . esc_url($asset_base), 'src="' . esc_url($asset_base), 'href="' . esc_url($asset_base), "src='" . esc_url($asset_base), "href='" . esc_url($asset_base)),
        $html
    );

    // Default autostart is scoped to the WP game document, not standalone builds.
    $html = preg_replace('~<html\b~i', '<html data-bargheto-wp="1"', $html, 1);

    // Controls and FPS are included by the game build in every deployment.

    // Browser title only, not a runtime game or quality change.
    $html = preg_replace('~<title>.*?</title>~is', '<title>شهر هوشمند انرژی برقتو</title>', $html, 1);
    // Same-origin path keeps cookies aligned when a proxy or canonical host changes the URL.
    $registration = wp_json_encode(array('endpoint'=>admin_url('admin-ajax.php','relative')),JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT);
    $media = bargheto_city_media_status();
    // The game requests every GLB + MP3 via these public WordPress uploads URLs.
    // This bootstrap must run before the deferred Vite ES module.
    $solar_url = bargheto_city_solar_url();
    if ($solar_url !== null) { $media['urls']['solar-substation-transformer.glb'] = $solar_url; }
    $media_json = wp_json_encode($media['urls'], JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_SLASHES);
    $downloads = bargheto_city_vehicle_downloads83();
    $vehicle_json = wp_json_encode($downloads['urls'], JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_SLASHES);
    $fallback_json = wp_json_encode($downloads['fallbacks'], JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_SLASHES);
    $layout_config = wp_json_encode(array('endpoint'=>admin_url('admin-ajax.php','relative')), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
    $office_config = wp_json_encode(array('url'=>add_query_arg('action','bargheto_city_office97',admin_url('admin-ajax.php','relative')), 'cityUrl'=>home_url('/barghetocity/'), 'native97'=>true,'mediaBase'=>bargheto_city_server_base109(),'sourceUrl'=>wp_make_link_relative(plugins_url('office/source-v22.html',__FILE__)),'sourceSHA'=>'31cb1415ca7ea64614fced5abc7a0cc5308fdb7f5247a7ad082d3a88878d69d8'), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
    $expert_voice_json = wp_json_encode(bargheto_city_expert_voice(), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_SLASHES);
    $bootstrap = bargheto_city_cache_boot109() . '<script>window.barghetoCityServerMedia109=' . wp_json_encode(bargheto_city_server_urls109(),JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT) . ';window.barghetoCityExpertVoice=' . $expert_voice_json . ';window.barghetoMultiplayer=' . $layout_config . ';window.barghetoLayout=' . $layout_config . ';window.barghetoCityVehicleUrls=' . $vehicle_json . ';window.barghetoCityModelFallbacks83=' . $fallback_json . ';window.barghetoCityAssetUrls=' . $media_json . ';window.barghetoCityAssetUrl=function(name){if(!Object.prototype.hasOwnProperty.call(window.barghetoCityAssetUrls,name)){throw new Error("Missing server asset: "+name)}return window.barghetoCityAssetUrls[name]};</script>';
    $bootstrap .= '<script src="' . esc_url($asset_base . 'media-urls-2.5.223.js') . '"></script>';
    $html = str_replace('<head>', '<head><script>window.barghetoOffice=' . $office_config . ';window.barghetoRegistration=' . $registration . ';</script>' . $bootstrap, $html);
    return $html;
}

/** Full-screen standalone response: WP themes/CSS cannot interfere with WebGL. */
function bargheto_city_serve() {
    if ((string) get_query_var('bargheto_city', '') !== '1') {
        return;
    }

    bargheto_city_document_gate109();
    $media = bargheto_city_media_status();
    $media['missing']=array_merge($media['missing'],bargheto_city_server_missing109());
    $media['total']+=count(bargheto_city_server_manifest109());
    if (count($media['missing']) > 0) {
        // Avoid starting Three.js with missing GLBs and a partially rendered world.
        status_header(503);
        header('Content-Type: text/html; charset=UTF-8');
        nocache_headers();
        echo '<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>مدل‌های شهر برقتو نصب نشده‌اند</title><body style="font-family:Tahoma,sans-serif;background:#101827;color:#f7fafc;padding:8vh 6vw;line-height:2"><h1>فایل‌های سه‌بعدی شهر برقتو هنوز روی سرور نصب نشده‌اند</h1><p>مدیر سایت باید بسته «فایل‌های سرور» را از پنل «شهر هوشمند انرژی برقتو» بارگذاری کند.</p><p style="color:#bcccdc">' . esc_html(count($media['missing'])) . ' فایل از ' . esc_html($media['total']) . ' فایل لازم در دسترس نیست.</p></body></html>';
        exit;
    }
    $html = bargheto_city_html();
    if ($html === null) {
        status_header(500);
        header('Content-Type: text/plain; charset=UTF-8');
        echo 'شهر هوشمند انرژی برقتو: game/dist/index.html is missing or unreadable.';
        exit;
    }

    status_header(200);
    header('Content-Type: text/html; charset=UTF-8');
    header('X-Content-Type-Options: nosniff');
    // Avoid serving a stale HTML entry after replacing hashed JS/CSS assets.
    nocache_headers();
    echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted local build, URLs escaped.
    exit;
}
add_action('template_redirect', 'bargheto_city_serve', 0);

/** Optional embed into any WP page; separate from the dedicated full-screen route. */
function bargheto_city_shortcode($atts = array()) {
    $atts = shortcode_atts(array('height' => '85vh'), $atts, 'bargheto_city');
    $height = (string) $atts['height'];
    if (!preg_match('/^\d+(?:\.\d+)?(?:px|vh|vw|rem|em|%)$/', $height)) {
        $height = '85vh';
    }
    $id = wp_unique_id('bargheto-city-iframe-');
    $iframe = '<iframe id="' . esc_attr($id) . '" title="شهر هوشمند انرژی برقتو" src="' . esc_url(home_url('/barghetocity/')) . '" loading="eager" sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms" allow="fullscreen; autoplay; microphone; gamepad; xr-spatial-tracking" allowfullscreen style="display:block;width:100%;height:' . esc_attr($height) . ';border:0;background:#060911;"></iframe>';
    // Only forward game keys if the parent owns keyboard focus while the pointer is over the frame.
    // Release held keys on pointer exit or tab blur to avoid stuck movement.
    $bridge = '<script>(function(){const iframe=document.getElementById(' . wp_json_encode($id) . ');if(!iframe)return;let hovered=false;const held=new Map();const codes=new Set(["KeyW","KeyA","KeyS","KeyD","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space","KeyC","KeyG","KeyE","ShiftLeft","ShiftRight","F3","F2","F4","Delete","Escape","KeyZ","KeyV"]);function send(kind,data){try{iframe.contentWindow.dispatchEvent(new KeyboardEvent(kind,{code:data.code,key:data.key,repeat:data.repeat||false,ctrlKey:data.ctrlKey||false,metaKey:data.metaKey||false,shiftKey:data.shiftKey||false,bubbles:true,cancelable:true}))}catch(_){}}function release(){for(const data of held.values())send("keyup",data);held.clear()}iframe.addEventListener("pointerenter",function(){hovered=true});iframe.addEventListener("pointerleave",function(){hovered=false;release()});window.addEventListener("blur",release);["keydown","keyup"].forEach(function(type){document.addEventListener(type,function(e){if(!codes.has(e.code))return;if(type==="keyup"&&held.has(e.code)){send("keyup",held.get(e.code));held.delete(e.code);e.preventDefault();return}if(!hovered)return;const element=e.target;if(element&&((element.closest&&element.closest("input,textarea,select,[contenteditable]"))||element.isContentEditable))return;if(e.altKey||((e.ctrlKey||e.metaKey)&&!["KeyC","KeyV","KeyZ"].includes(e.code)))return;const data={code:e.code,key:e.key,repeat:e.repeat,ctrlKey:e.ctrlKey,metaKey:e.metaKey,shiftKey:e.shiftKey};send(type,data);if(type==="keydown")held.set(e.code,data);e.preventDefault()},true)})})();</script>';
    return $iframe . $bridge;
}
add_shortcode('bargheto_city', 'bargheto_city_shortcode');

function bargheto_city_admin_menu() {
    add_menu_page('شهر هوشمند انرژی برقتو', 'شهر هوشمند انرژی برقتو', 'manage_options', 'bargheto-city', 'bargheto_city_admin_page', 'dashicons-location-alt', 61);
}
add_action('admin_menu', 'bargheto_city_admin_menu');

function bargheto_city_rebuild_rewrite() {
    if (!current_user_can('manage_options')) {
        wp_die('Not permitted.');
    }
    check_admin_referer('bargheto_city_refresh_rewrite');
    bargheto_city_register_route();
    flush_rewrite_rules();
    wp_safe_redirect(add_query_arg(array('page' => 'bargheto-city', 'route_refreshed' => '1'), admin_url('admin.php')));
    exit;
}
add_action('admin_post_bargheto_city_refresh_rewrite', 'bargheto_city_rebuild_rewrite');

/** City entry, current exports and the current server-media uploader. */
function bargheto_city_admin_page() {
    if (!current_user_can('manage_options')) {
        return;
    }
    ?>
    <div class="wrap" dir="rtl" style="max-width:760px;">
        <h1>شهر هوشمند <span style="color:#22864c">انرژی</span> برقتو — V2.5.250 | ۱۴۰۵/۰۸/۱۵</h1>
        <p><a class="button button-primary" href="<?php echo esc_url(home_url('/barghetocity/')); ?>" target="_blank" rel="noopener noreferrer">ورود به شهر برقتو</a></p>
        <p><a href="<?php echo esc_url(home_url('/barghetocity/')); ?>" target="_blank" rel="noopener noreferrer" dir="ltr"><?php echo esc_html(home_url('/barghetocity/')); ?></a></p>
        <section style="margin:24px 0;padding:20px;background:#fff;border:1px solid #c3c4c7;border-radius:8px;">
            <h2 style="margin-top:0;">دریافت افزونه</h2>
            <p>خروجی‌ها از همین نسخهٔ نصب‌شده و داده‌های ذخیره‌شدهٔ فعلی بازی ساخته می‌شوند.</p>
            <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
                <input type="hidden" name="action" value="bargheto_city_portable_export">
                <?php wp_nonce_field('bargheto_city_portable_export'); ?>
                <?php submit_button('دانلود کامل افزونه', 'primary', 'submit', false, class_exists('ZipArchive') ? array() : array('disabled'=>'disabled')); ?>
                <p class="description">همراه مدل‌ها، صداها، تنظیمات و داده‌های ذخیره‌شدهٔ بازی.</p>
            </form>
            <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" style="margin-top:18px;">
                <input type="hidden" name="action" value="bargheto_city_portable_export">
                <input type="hidden" name="media_mode" value="external">
                <?php wp_nonce_field('bargheto_city_portable_export'); ?>
                <?php submit_button('دانلود نسخهٔ سبک', 'secondary', 'submit', false, class_exists('ZipArchive') ? array() : array('disabled'=>'disabled')); ?>
                <p class="description">بدون عکس، مدل، صدا و ویدیو؛ شامل کد، تنظیمات و داده‌های ذخیره‌شدهٔ بازی.</p>
            </form>
            <?php if (!class_exists('ZipArchive')): ?>
                <p style="color:#b32d2e;">برای ساخت خروجی ZIP، قابلیت PHP ZipArchive باید روی هاست فعال باشد.</p>
            <?php endif; ?>
            <p class="description">پیش از دانلود، منتظر تأیید ذخیرهٔ تغییرها روی سرور بمانید. خروجی‌ها شامل داده‌های بازدیدکنندگان هستند؛ آن‌ها را خصوصی نگه دارید.</p>
        </section>
        <?php bargheto_city_media_status211(); ?>
        <?php bargheto_city_server_admin109(); ?>
    </div>
    <?php
}
