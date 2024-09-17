<?php
if( strpos(__DIR__, 'wp-content\plugins') === -1 ) return; // dev mode

// add_filter('ff_ajax_response', function($response, $payload, $query){
//     if( $response['id'] == 'id_here' ) {
//         $response['sample_filter'] = $query->request;
//     }
//     return $response;
// }, 10, 3);

add_action('wp_footer', function(){
	include 'sample.php';
    // include 'prototype.php';
});