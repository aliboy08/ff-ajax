<?php
add_action('wp_ajax_ff_ajax_action', 'ff_ajax_action');
add_action('wp_ajax_nopriv_ff_ajax_action', 'ff_ajax_action');
function ff_ajax_action(){

    if ( ! wp_verify_nonce( $_POST['nonce'], 'ff_ajax' ) ) die();

    $payload = $_POST;

    $response = [
        'request_time' => $payload['request_time'],
    ];

    $query_args = json_decode(stripslashes($payload['query_args']), true);
    $payload['query_args'] = $query_args;

    if( isset($payload['custom_data']) ) {
        $custom_data = json_decode(stripslashes($payload['custom_data']), true);
    }

    if( isset($payload['custom_filters']) ) {
        $payload['custom_filters'] = json_decode(stripslashes($payload['custom_filters']), true);
    }
    
    if( isset($payload['custom_action']) ) {
        // Custom
        ob_start();
        do_action('ff_ajax_'. $payload['custom_action'], $payload);
        $response['html'] = ob_get_clean();
        wp_send_json($response);
    }

    $item_template = $payload['item_template'];

    if( !file_exists( $item_template ) ) {
        $response['error'] = 'template_not_found';
        wp_send_json($response);
    }
    
    $query_args = apply_filters('ff_ajax_query_args', $query_args, $payload);

    $query = new WP_Query($query_args);
    ob_start();
    foreach( $query->posts as $post ) {
        include $item_template;
    }
    $response['html'] = ob_get_clean();
    
    $total_posts = count($query->posts) + $payload['total_posts'];
    $response['total_posts'] = $total_posts;
    $response['have_more_posts'] = ff_ajax_have_more_posts($query_args, $total_posts);

    $response = apply_filters('ff_ajax_response', $response, $payload, $query);

    $response['payload'] = $payload;

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