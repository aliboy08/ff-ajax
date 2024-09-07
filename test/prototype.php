<?php
$query_args = [
    'post_type' => 'post',
    'showposts' => 2,
    'no_found_rows' => true,
];

function ffdb($args){

    global $wpdb;

    $post_type = $args['post_type'] ?? 'post';
    $post_status = $args['post_status'] ?? 'publish';
    $term_id = $args['term_id'] ?? null;
    $meta_key = $args['meta_key'] ?? null;
    $meta_value = $args['meta_value'] ?? null;

    $select = $args['select'];
    $select_query = 'ID';

    if( $select == 'count' ) {
        $select_query = 'count(ID) as count';
    }

    $join = '';
    if( $term_id !== null ) {
        $join .= " LEFT JOIN {$wpdb->prefix}term_relationships ON object_id = ID";
    }

    if( $meta_key !== null ) {
        $join .= " LEFT JOIN {$wpdb->prefix}postmeta ON post_id = ID";
    }

    $query = "SELECT {$select_query} FROM {$wpdb->prefix}posts {$join} WHERE post_status = '{$post_status}' AND post_type = '{$post_type}'";

    if( $term_id !== null ) {
        $query .= " AND term_taxonomy_id = {$term_id}";
    }

    if( $meta_key !== null ) {
        $query .= " AND meta_key = '{$meta_key}'";
    }

    if( $meta_value !== null ) {
        $query .= " AND meta_value = '{$meta_value}'";
    }

    $result = $wpdb->get_results($query);

    if( $select == 'count' ) {
        return $result[0]->count;
    }

    $ids = [];
    foreach( $result as $row ) {
        $ids[] = $row->ID;
    }

    return $ids;
}

$start = microtime(true);
// $count = get_posts_count([
//     'post_type' => 'post',
//     'meta_key' => 'mode',
//     'meta_value' => 'test',
//     // 'term_id' => 2,
// ]);
$ids = ffdb([
    // 'select' => 'count',
    'post_type' => 'post',
    // 'meta_key' => 'mode',
    // 'meta_value' => 'test',
    // 'term_id' => 2,
]);
$time = microtime(true) - $start;
pre_debug([
    // 'count' => $count,
    'ids' => $ids,
    'time' => $time,
]);

// $start = microtime(true);
// $query_args = [
//     'post_type' => 'post',
//     'no_found_rows' => true,
//     'showposts' => -1,
//     'fields' => 'ids',
// ];
// $q = new WP_Query($query_args);
// $count = count($q->posts);
// $time = microtime(true) - $start;
// pre_debug([
//     'count' => $count,
//     'time' => $time,
// ]);