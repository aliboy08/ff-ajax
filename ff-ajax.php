<?php
/**
 * Plugin Name: FF Ajax
 * Plugin URI: https://www.fivebyfive.com.au/
 * Description: Simplify development involving ajax
 * Version: 2.0.0
 * Author: Five by Five
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 */

if ( ! defined( 'ABSPATH' ) ) die();

class FF_Plugin_Ajax {

    public $id = 'ff-ajax';
    public $vite;
    
    function __construct(){
        
        $this->vite = new FF_Vite([
            'id' => $this->id,
            'url' => plugins_url('/', __FILE__),
            'path' => plugin_dir_path(__FILE__),
        ]);
    }
    
    function enqueue(){

        $this->vite->enqueue('main', 'src/main.js');

        wp_localize_script($this->id.'_main', 'ff_ajax_data', [
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('ff_ajax'),
        ]);
    }

}

add_action('plugins_loaded', function(){
    $GLOBALS['ff_ajax'] = new FF_Plugin_Ajax();
});

include_once 'functions.php';
include_once 'class-ff-ajax.php';

add_action('wp_footer', function(){
    include 'sample.php';
});