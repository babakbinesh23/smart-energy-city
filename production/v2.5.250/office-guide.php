<?php
/** Keep the public office guide responsive to a visitor changing departments. */
if (!defined('ABSPATH')) { exit; }

function bargheto_city_office_guide_interrupt85() {
    // Only the office page loads its entry point. No city assets or extra models
    // are downloaded here, and the standalone office remains independently owned.
    if (!wp_script_is('babylon-office-entry', 'enqueued')) { return; }
    wp_enqueue_script('bargheto-expert-rate93', plugins_url('game/dist/assets/expert-rate-2.5.93-r109.js', __FILE__), array(), '2.5.93', true);
    wp_enqueue_script(
        'bargheto-office-guide-interrupt',
        plugins_url('game/dist/assets/office-guide-2.5.93-r109.js', __FILE__),
        array('babylon-office-entry', 'bargheto-expert-rate93'),
        '2.5.93',
        true
    );
}
add_action('wp_enqueue_scripts', 'bargheto_city_office_guide_interrupt85', 100);
// Shortcodes can enqueue the office after wp_enqueue_scripts has already run.
// Register before WordPress prints footer scripts (priority 20), without duplicates.
add_action('wp_footer', 'bargheto_city_office_guide_interrupt85', 5);
