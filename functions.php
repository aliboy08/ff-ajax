<?php
add_action('wp_ajax_ff_ajax_action', 'ff_ajax_action');
add_action('wp_ajax_nopriv_ff_ajax_action', 'ff_ajax_action');
function ff_ajax_action(){

    if ( ! wp_verify_nonce( $_POST['nonce'], 'ff_ajax' ) ) die();

    sleep(1);

    $response = [
        'payload' => $_POST,
        'request_time' => $_POST['request_time'],
    ];
    
    if( isset($_POST['custom_query']) ) {
        // Custom
        ob_start();
        do_action('ff_ajax_'. $_POST['ajax_action'], $_POST);
        $response['html'] = ob_get_clean();
        wp_send_json($response);
    }

    $item_template = $_POST['item_template'];

    if( !file_exists( $item_template ) ) {
        $response['error'] = 'template_not_found';
        wp_send_json($response);
    }

    // Standard

    // if( is_array($_POST['query_args']) ) {
    //     // jquery support
    //     $query_args = $_POST['query_args'];
    // } else {
    //     // fetch support
    //     $query_args = json_decode(stripslashes($_POST['query_args']), true); 
    // }

    $query_args = json_decode(stripslashes($_POST['query_args']), true);
    $response['query_args'] = $query_args; 
    
    // $query_args = apply_filters('ff_ajax_query_args_'. $_POST['ajax_action'], $query_args, $this, $_POST);
    
    if( isset($_POST['custom_data']) ) {
        $custom_data = $_POST['custom_data'];
    }

    $query = new WP_Query($query_args);
    ob_start();
    foreach( $query->posts as $post ) {
        include $item_template;
    }
    $response['html'] = ob_get_clean();
    
    $total_posts = count($query->posts) + $_POST['total_posts'];
    $response['total_posts'] = $total_posts;
    $response['have_more_posts'] = ff_ajax_have_more_posts($query_args, $total_posts);

    wp_send_json($response);
}

function ff_ajax_have_more_posts($args, $offset) {

    $args['showposts'] = 1;
    $args['fields'] = 'ids';

    if( $offset ) {
        $args['offset'] = $offset;
    }

    $q = get_posts( $args );
    if( $q ) {
        return true;
    }

    return 0;
}

// add_action('wp_loaded', 'ff_ajax_register_scripts');
// function ff_ajax_register_scripts(){
//     $url = plugin_dir_url(__FILE__);
//     $file = 'js/ff-ajax.js';
//     $version = '1.0';
//     $dir = plugin_dir_path(__FILE__);
//     $version = filemtime($dir.$file);
//     wp_register_script('ff-ajax', $url.$file, ['jquery'], $version, true);
//     wp_localize_script('ff-ajax', 'ff_ajax_data', [
//         'ajax_url' => admin_url('admin-ajax.php'),
//         'nonce' => wp_create_nonce('ff_ajax'),
//     ]);
// }