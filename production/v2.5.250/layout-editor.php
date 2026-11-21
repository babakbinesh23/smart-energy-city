<?php
/** Shared scene layout, stored outside plugin files so upgrades preserve edits. */
if (!defined('ABSPATH')) { exit; }

function bargheto_city_layout_seed() {
    $seed = $_POST['seed'] ?? '';
    if (!is_string($seed) || !preg_match('/^[1-9][0-9]{0,9}$/D', $seed) || (float)$seed > 2147483647) {
        wp_send_json_error(array('message'=>'شناسه نقشه معتبر نیست.'), 400);
    }
    return (int)$seed;
}
function bargheto_city_layout_target($value, $base_only = false) {
    if (!is_array($value) || !isset($value['kind'], $value['source']) || !is_string($value['source']) || strlen($value['source']) > 2048 || substr($value['source'], 0, 1) !== '/') { return null; }
    $kind = $value['kind']; $out = array('kind'=>$kind, 'source'=>$value['source']);
    if ($kind === 'node') { return $out; }
    if ($kind === 'instance' || $kind === 'part') {
        $key = $kind === 'instance' ? 'index' : 'face';
        if (!isset($value[$key]) || !is_int($value[$key]) || $value[$key] < 0 || $value[$key] > 2000000) { return null; }
        $out[$key] = $value[$key]; return $out;
    }
    if ($kind === 'copy' && !$base_only && isset($value['id'], $value['template']) && is_string($value['id']) && preg_match('/^[a-zA-Z0-9-]{1,100}$/D', $value['id'])) {
        $template = bargheto_city_layout_target($value['template'], true);
        if (!$template || $template['source'] !== $out['source']) { return null; }
        $out['id'] = $value['id']; $out['template'] = $template; return $out;
    }
    return null;
}
function bargheto_city_layout_validate($value) {
    if (!is_array($value) || !in_array($value['schema'] ?? null, array(2, 3), true) || !isset($value['items']) || !is_array($value['items']) || count($value['items']) > 1000) { return null; }
    $plan_revision = $value['planRevision'] ?? 0;
    if (!is_int($plan_revision) || $plan_revision < 0 || $plan_revision > 9) { return null; }
    $items = array(); $keys = array();
    foreach ($value['items'] as $item) {
        if (!is_array($item)) { return null; }
        $target = bargheto_city_layout_target($item['target'] ?? null); $pose = $item['pose'] ?? null;
        if (!$target || !is_array($pose) || !isset($pose['position'], $pose['quaternion'], $pose['placed']) || !is_bool($pose['placed']) || !is_array($pose['position']) || count($pose['position']) !== 3 || !is_array($pose['quaternion']) || count($pose['quaternion']) !== 4 || (isset($pose['deleted']) && !is_bool($pose['deleted']))) { return null; }
        foreach (array_merge($pose['position'], $pose['quaternion']) as $number) { if ((!is_int($number) && !is_float($number)) || !is_finite((float)$number)) { return null; } }
        foreach ($pose['position'] as $number) { if (abs($number) > 2000) { return null; } }
        $norm = 0; foreach ($pose['quaternion'] as $number) { $norm += $number * $number; }
        if ($norm < .000001 || $norm > 4) { return null; }
        $key = wp_json_encode($target); if (isset($keys[$key])) { return null; } $keys[$key] = true;
        $clean_pose = array('position'=>array_values($pose['position']), 'quaternion'=>array_values($pose['quaternion']), 'placed'=>$pose['placed'], 'deleted'=>!empty($pose['deleted']));
        // Absent scale keeps legacy layouts at their authored size. Never strip a supplied size.
        if (array_key_exists('scale', $pose)) {
            if (!is_array($pose['scale']) || count($pose['scale']) !== 3) { return null; }
            foreach ($pose['scale'] as $number) {
                if ((!is_int($number) && !is_float($number)) || !is_finite((float)$number) || abs($number) < 1e-9 || abs($number) > 1e6) { return null; }
            }
            $clean_pose['scale'] = array_values($pose['scale']);
        }
        $clean_item = array('target'=>$target, 'pose'=>$clean_pose);
        // Preserve new factory edits; old model poses must not undo its replacement placement.
        if (array_key_exists('modelRevision', $item)) {
            if (!in_array($item['modelRevision'], array(197, 199), true) || !preg_match('~/supplied-victorian-factory:0$~D', $target['source'])) { return null; }
            $clean_item['modelRevision'] = $item['modelRevision'];
        }
        $items[] = $clean_item;
    }
    return array('schema'=>$value['schema'], 'planRevision'=>$plan_revision, 'items'=>$items);
}
function bargheto_city_layout_load() {
    nocache_headers();
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') { wp_send_json_error(array('message'=>'روش درخواست معتبر نیست.'), 405); }
    $seed = bargheto_city_layout_seed(); $record = get_option('bargheto_city_layout_' . $seed, null); $can_edit = bargheto_city_is_admin();
    wp_send_json_success(array('revision'=>is_array($record) ? (int)$record['revision'] : 0, 'layout'=>is_array($record) ? $record['layout'] : null, 'canEdit'=>$can_edit, 'nonce'=>$can_edit ? wp_create_nonce('bargheto_city_layout') : null));
}
add_action('wp_ajax_bargheto_city_layout_load', 'bargheto_city_layout_load');
add_action('wp_ajax_nopriv_bargheto_city_layout_load', 'bargheto_city_layout_load');

function bargheto_city_layout_save() {
    global $wpdb;
    nocache_headers();
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') { wp_send_json_error(array('message'=>'روش درخواست معتبر نیست.'), 405); }
    if (!bargheto_city_is_admin()) { wp_send_json_error(array('message'=>'برای ذخیره روی سرور از دکمه ورود ادمین وارد شوید.'), 403); }
    if (!check_ajax_referer('bargheto_city_layout', 'nonce', false)) { wp_send_json_error(array('message'=>'اعتبار ورود تمام شده؛ صفحه را تازه کنید. تغییرهای فعلی هنوز ذخیره نشده‌اند.'), 403); }
    $seed = bargheto_city_layout_seed(); $json = $_POST['layout'] ?? null; $revision = $_POST['revision'] ?? null;
    if (!is_string($json) || strlen($json) > 1048576 || !is_string($revision) || !preg_match('/^[0-9]{1,10}$/D', $revision)) { wp_send_json_error(array('message'=>'اطلاعات چیدمان معتبر نیست یا بیش از حد بزرگ است.'), 400); }
    $layout = bargheto_city_layout_validate(json_decode(wp_unslash($json), true, 32));
    if ($layout === null) { wp_send_json_error(array('message'=>'ساختار چیدمان معتبر نیست؛ ذخیره انجام نشد.'), 400); }
    $key = 'bargheto_city_layout_' . $seed; $old = get_option($key, null); $expected = (int)$revision;
    if (is_array($old) && ($old['layout']['planRevision'] ?? 0) > $layout['planRevision']) { wp_send_json_error(array('message'=>'این صفحه از نسخه قدیمی نقشه استفاده می‌کند؛ پیش از ذخیره صفحه را تازه کنید.'), 409); }
    if (is_array($old) && ($old['layout']['schema'] ?? 2) > $layout['schema']) { wp_send_json_error(array('message'=>'این صفحه از ویرایشگر قدیمی استفاده می‌کند؛ برای حفظ اندازه اجسام صفحه را تازه کنید.'), 409); }
    if ((is_array($old) ? (int)$old['revision'] : 0) !== $expected) { wp_send_json_error(array('message'=>'مدیر دیگری چیدمان را تغییر داده است؛ تغییرهای شما ذخیره نشدند. پیش از ادامه صفحه را تازه کنید.'), 409); }
    $next = array('revision'=>$expected + 1, 'layout'=>$layout, 'updated_at'=>gmdate('c'), 'updated_by'=>get_current_user_id());
    if ($old === null) { $saved = add_option($key, $next, '', false); }
    else {
        // Compare-and-swap closes the race between reading and saving in two browsers.
        $result = $wpdb->query($wpdb->prepare("UPDATE {$wpdb->options} SET option_value = %s WHERE option_name = %s AND BINARY option_value = %s", maybe_serialize($next), $key, maybe_serialize($old)));
        $saved = $result === 1;
        if ($result === false) { wp_send_json_error(array('message'=>'ذخیره در پایگاه داده انجام نشد؛ دوباره تلاش کنید.'), 500); }
    }
    wp_cache_delete($key, 'options');
    if (!$saved) { wp_send_json_error(array('message'=>'چیدمان هم‌زمان تغییر کرده است؛ ذخیره انجام نشد. صفحه را تازه کنید.'), 409); }
    wp_send_json_success(array('revision'=>$next['revision'], 'nonce'=>wp_create_nonce('bargheto_city_layout')));
}
add_action('wp_ajax_bargheto_city_layout_save', 'bargheto_city_layout_save');
add_action('wp_ajax_nopriv_bargheto_city_layout_save', 'bargheto_city_layout_save');
