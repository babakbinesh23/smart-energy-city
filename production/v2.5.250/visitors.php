<?php
if (!defined('ABSPATH')) { exit; }
add_action('init', function () {
    register_post_type('bargheto_visitor', array(
        'labels'=>array('name'=>'ورودهای شهر برقتو','singular_name'=>'بازدیدکننده'),
        'public'=>false,'publicly_queryable'=>false,'show_in_rest'=>false,
        'show_ui'=>true,'show_in_menu'=>true,'supports'=>array('title'),
        'capabilities'=>array('edit_post'=>'manage_options','read_post'=>'manage_options','delete_post'=>'manage_options','edit_posts'=>'manage_options','edit_others_posts'=>'manage_options','publish_posts'=>'manage_options','read_private_posts'=>'manage_options','create_posts'=>'do_not_allow','delete_posts'=>'manage_options','delete_others_posts'=>'manage_options','edit_private_posts'=>'manage_options','edit_published_posts'=>'manage_options','delete_private_posts'=>'manage_options','delete_published_posts'=>'manage_options'),
        'map_meta_cap'=>false,
    ));
});
add_filter('manage_bargheto_visitor_posts_columns',function($columns){$columns['mobile']='شماره موبایل';return $columns;});
add_action('manage_bargheto_visitor_posts_custom_column',function($column,$id){if($column==='mobile'&&current_user_can('manage_options')){echo esc_html(get_post_meta($id,'_bargheto_mobile',true));}},10,2);
/** Mint for the current browser session, independently of cached game HTML. */
function bargheto_city_visitor_token(){
 nocache_headers();
 header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0, private');
 if(($_SERVER['REQUEST_METHOD']??'')!=='POST'){wp_send_json_error(array('message'=>'روش درخواست معتبر نیست.'),405);}
 if(($_SERVER['HTTP_X_BARGHETO_REQUEST']??'')!=='visitor'){wp_send_json_error(array('message'=>'درخواست اعتبارسنجی معتبر نیست.'),403);}
 wp_send_json_success(array('nonce'=>wp_create_nonce('bargheto_visitor')));
}
add_action('wp_ajax_nopriv_bargheto_city_visitor_token','bargheto_city_visitor_token');
add_action('wp_ajax_bargheto_city_visitor_token','bargheto_city_visitor_token');
function bargheto_city_register_visitor(){
 nocache_headers();
 if(($_SERVER['REQUEST_METHOD']??'')!=='POST'){wp_send_json_error(array('message'=>'روش درخواست معتبر نیست.'),405);}
 if(!check_ajax_referer('bargheto_visitor','nonce',false)){wp_send_json_error(array('code'=>'nonce_expired','message'=>'اعتبار فرم تغییر کرده است؛ دوباره روی ورود بزنید.'),403);}
 if(!isset($_POST['name'],$_POST['mobile'])||!is_string($_POST['name'])||!is_string($_POST['mobile'])){wp_send_json_error(array('message'=>'نام و موبایل را وارد کنید.'),400);}
 $name=sanitize_text_field(wp_unslash($_POST['name']));$mobile=wp_unslash($_POST['mobile']);
 $name_length=preg_match_all('/./us',$name,$chars);
 if(!preg_match('/^09[0-9]{9}$/D',$mobile)||!preg_match('/\p{L}/u',$name)||$name_length<2||$name_length>80){wp_send_json_error(array('message'=>'نام یا شماره موبایل معتبر نیست.'),400);}
 $rate_key='bc_visit_'.hash_hmac('sha256',$_SERVER['REMOTE_ADDR']??'unknown',wp_salt());$attempts=(int)get_transient($rate_key);
 if($attempts>=10){wp_send_json_error(array('message'=>'تعداد تلاش‌ها زیاد است؛ چند دقیقه بعد دوباره تلاش کنید.'),429);}
 set_transient($rate_key,$attempts+1,10*MINUTE_IN_SECONDS);
 $id=wp_insert_post(array('post_type'=>'bargheto_visitor','post_status'=>'private','post_title'=>$name,'meta_input'=>array('_bargheto_mobile'=>$mobile)),true);
 if(is_wp_error($id)||!$id){wp_send_json_error(array('message'=>'ذخیره اطلاعات انجام نشد؛ دوباره تلاش کنید.'),500);}
 wp_send_json_success(array('registered'=>true));
}
add_action('wp_ajax_nopriv_bargheto_city_register_visitor','bargheto_city_register_visitor');
add_action('wp_ajax_bargheto_city_register_visitor','bargheto_city_register_visitor');
