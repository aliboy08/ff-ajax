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

    $extra_query_args = json_decode(stripslashes($payload['extra_query_args']), true);

    // $response['extra_query_args'] = $extra_query_args;
    
    $query_args = apply_filters('ff_ajax_query_args', $query_args, $payload);

    $query_args = ff_ajax_apply_extra_query_args($extra_query_args, $query_args);

    // $response['updated_query_args'] = $query_args;

    $query = new WP_Query($query_args);
    ob_start();
    foreach( $query->posts as $post ) {
        include $item_template;
    }
    $response['html'] = ob_get_clean();
    
    $total_posts = count($query->posts) + $payload['total_posts'];
    $response['total_posts'] = $total_posts;

    $have_more_posts = ff_ajax_have_more_posts($query_args, $total_posts);
    $response['have_more_posts'] = $have_more_posts;
    
    if( $payload['with_total_posts_count'] ) {
        $response['total_posts_count'] = !$have_more_posts ? $total_posts : ff_ajax_get_total_posts_count( $query->request );
    }

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
        $query_args['s'] = $extra_query_args['search'];
    }

    // sort
    if( isset($extra_query_args['sort']) ) {
        foreach( $extra_query_args['sort'] as $key => $value ) {
            $query_args[$key] = $value;
        }
    }
    
    return $query_args;
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

function ff_ajax_get_total_posts_count($query_request){

    global $wpdb;
    
    // remove extra white spaces
    $count_query = preg_replace('/\s+/', ' ', $query_request);
    
    // replace select with count
    $count_query = preg_replace('/SELECT .* FROM /', 'SELECT COUNT(DISTINCT '. $wpdb->prefix .'posts.ID) as count FROM ', $count_query);

    // remove group by
    $count_query = preg_replace('/ GROUP BY .*/', '', $count_query);

    // remove order by
    $count_query = preg_replace('/ ORDER BY .*/', '', $count_query);

    // remove limit
    $count_query = preg_replace('/ LIMIT .*/', '', $count_query);
    
    $result = $wpdb->get_results($count_query);
    
    return $result[0]->count;
}