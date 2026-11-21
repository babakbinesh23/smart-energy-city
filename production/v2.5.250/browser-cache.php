<?php
if (!defined('ABSPATH')) { exit; }
function bargheto_city_cache_worker109() {
    if((string)get_query_var('bargheto_city','')!=='1'||($_GET['bc_worker109']??'')!=='1')return;
    nocache_headers();header('Content-Type: application/javascript; charset=UTF-8');header('X-Content-Type-Options: nosniff');
    $cfg=array('version'=>bargheto_city_portable_version(),'pluginPath'=>wp_parse_url(trailingslashit(plugins_url('',__FILE__)),PHP_URL_PATH),'mediaPath'=>wp_parse_url(bargheto_city_server_base109(),PHP_URL_PATH),'ajaxPath'=>wp_parse_url(admin_url('admin-ajax.php'),PHP_URL_PATH));
    echo 'self.BC_CACHE_CONFIG109='.wp_json_encode($cfg,JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT).';';readfile(__DIR__.'/game/dist/cache-worker-2.5.109.js');exit;
}
add_action('template_redirect','bargheto_city_cache_worker109',-1);
function bargheto_city_cache_boot109(){
    $cfg=wp_json_encode(array('worker'=>wp_make_link_relative(add_query_arg('bc_worker109','1',home_url('/barghetocity/'))),'scope'=>wp_parse_url(home_url('/barghetocity/'),PHP_URL_PATH)),JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT);
    return '<script>window.barghetoCacheReady109=(async()=>{const c='.$cfg.';if(!isSecureContext||!("serviceWorker" in navigator))return false;try{await navigator.serviceWorker.register(c.worker,{scope:c.scope,updateViaCache:"none"});if(navigator.serviceWorker.controller)return true;return await new Promise(resolve=>{const done=()=>{clearTimeout(timer);navigator.serviceWorker.removeEventListener("controllerchange",done);resolve(!!navigator.serviceWorker.controller)};const timer=setTimeout(done,4000);navigator.serviceWorker.addEventListener("controllerchange",done)});}catch{return false;}})();addEventListener("pointerdown",()=>{try{navigator.storage?.persist?.().catch(()=>{});}catch{}},{once:true});</script>';
}
