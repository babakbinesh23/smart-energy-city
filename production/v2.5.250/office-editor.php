<?php
/** Reuse the city editor in the independently installed Babylon office. */
if (!defined('ABSPATH')) { exit; }
function bargheto_city_office_shared_editor87() {
    static $attached = false;
    if ($attached || !wp_script_is('babylon-office-entry', 'enqueued')) { return; }
    $attached = true;
    $base = plugins_url('game/dist/assets/', __FILE__);
    wp_enqueue_style('bargheto-city-office-editor', $base . 'office-editor-2.5.87.css', array(), '2.5.87');
    // The city cookie is verified on the server. A query parameter grants no access.
    $token = '';
    if (bargheto_city_is_admin()) {
        $token = bin2hex(random_bytes(32));
        set_transient('bo_web_admin_' . hash('sha256', $token), 1, 8 * HOUR_IN_SECONDS);
    }
    $script = '(()=>{const config=window.BabylonOfficeConfig;if(!config?.editor)return;'
      . 'config.editor.sharedEditor=true;'
      . 'const token=' . wp_json_encode($token) . ';'
      . 'if(token){config.editor.token=token;config.editor.authenticated=true;try{sessionStorage.setItem("boAdminSession:"+location.host+":"+(config.editor.room||"main"),token)}catch(_){}}'
      . 'window.BarghetoGameEditor={mount:async options=>{const module=await import('
      . wp_json_encode($base . 'office-editor-2.5.87-r109.js') . ');return module.mountOfficeEditor87(options,window)}};})();';
    wp_add_inline_script('babylon-office-entry', $script, 'before');
    // Scope styles to the editor; the city stylesheet contains global game rules.
    wp_add_inline_style('bargheto-city-office-editor', '.world-editor{z-index:19000!important}.world-editor-panel{max-height:calc(100dvh - 32px);overflow:auto}');
}
add_action('wp_enqueue_scripts', 'bargheto_city_office_shared_editor87', 110);
add_action('wp_footer', 'bargheto_city_office_shared_editor87', 6);
