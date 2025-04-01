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

    if( isset($payload['extra_query_args']) ) {
        $extra_query_args = json_decode(stripslashes($payload['extra_query_args']), true);
        $response['extra_query_args'] = $extra_query_args;
        $query_args = ff_ajax_apply_extra_query_args($extra_query_args, $query_args);
    }
    
    $response['updated_query_args'] = $query_args;

    $query = new WP_Query($query_args);
    ob_start();
    foreach( $query->posts as $post_id ) {
        include $item_template;
    }
    $response['html'] = ob_get_clean();
    
    $total_posts = count($query->posts) + $query_args['offset'] ?? 0;
    $response['have_more_posts'] = $query->found_posts > $total_posts;

    $response['total_posts_count'] = $query->found_posts;

    $response = apply_filters('ff_ajax_response', $response, $payload, $query);

    $response['payload'] = $payload;

    wp_send_json($response);
}

function ff_ajax_apply_extra_query_args($extra_query_args, $query_args){
    
    // filters
    if( isset($extra_query_args['filters']) ) {

        // tax query
        if( $extra_query_args['filters']['tax_query'] ) {
            foreach( $extra_query_args['filters']['tax_query'] as $tax_query_args ) {
                $query_args['tax_query'][] = $tax_query_args;
            }
        }
    
        // meta query
        if( $extra_query_args['filters']['meta_query'] ) {
            foreach( $extra_query_args['filters']['meta_query'] as $meta_query_args ) {
                $query_args['meta_query'][] = $meta_query_args;
            }
        }
    }
    
    // search
    if( isset($extra_query_args['search']) ) {
        $s = $extra_query_args['search']['s'] ?? '';
        if( $s ) $query_args['s'] = $s;
    }

    // sort
    if( isset($extra_query_args['sort']) ) {
        foreach( $extra_query_args['sort'] as $key => $value ) {
            $query_args[$key] = $value;
        }
    }

    // load_more
    if( isset($extra_query_args['load_more']) ) {
        $offset = $query_args['offset'] ?? 0;
        $load_more_offset = $extra_query_args['load_more']['offset'] ?? 0;
        if( $load_more_offset ) {
            $query_args['offset'] = $offset + $load_more_offset;
        }
    }
    
    return $query_args;
}