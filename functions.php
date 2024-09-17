<?php
add_action('wp_ajax_ff_ajax_action', 'ff_ajax_action');
add_action('wp_ajax_nopriv_ff_ajax_action', 'ff_ajax_action');
function ff_ajax_action(){

    if ( ! wp_verify_nonce( $_POST['nonce'], 'ff_ajax' ) ) die();

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
    $query_args = json_decode(stripslashes($_POST['query_args']), true);
    
    if( isset($_POST['custom_data']) ) {
        $custom_data = $_POST['custom_data'];
    }

    $query_args = apply_filters('ff_ajax_query_args', $query_args, $_POST);

    $query = new WP_Query($query_args);
    ob_start();
    foreach( $query->posts as $post ) {
        include $item_template;
    }
    $response['html'] = ob_get_clean();
    
    $total_posts = count($query->posts) + $_POST['total_posts'];
    $response['total_posts'] = $total_posts;
    $response['have_more_posts'] = ff_ajax_have_more_posts($query_args, $total_posts);

    $response = apply_filters('ff_ajax_response', $response, $_POST, $query);

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