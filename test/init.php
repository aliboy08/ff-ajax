<?php
if( strpos(__DIR__, 'wp-content\plugins') === -1 ) return; // dev mode

add_action('wp_footer', function(){
    include 'sample.php';
});