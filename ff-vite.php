<?php
class FF_Vite {
    
    public $id;
    public $url;
    public $path;
    public $mode;
    public $manifest;
    public $server_origin;

    public function __construct( $options ){
        $this->id = $options['id'];
        $this->path = str_replace('\\', '/', $options['path']);
        $this->url = $this->get_url();
        $this->manifest = $this->get_manifest();
        $this->mode = $this->get_mode();
        $this->server_origin = $this->get_server_origin();
    }

    private function get_manifest(){
        $manifest_file = $this->path .'/dist/wp-manifest.json';
        $manifest = wp_json_file_decode( $manifest_file );
        return $manifest;
    }

    private function get_mode(){
        if( $_SERVER['REMOTE_ADDR'] !== '127.0.0.1' || file_exists('.production') || !$this->manifest ) {
            return 'build';
        }
        if( $this->manifest->mode == 'dev' ) {
            return 'dev';
        }
        return 'build';
    }

    private function get_server_origin(){
        $file = $this->path .'/dist/vite-dev-server.json';
        if( !file_exists( $file ) ) {
            return 'https://localhost:5173';
        }
        $server_config = wp_json_file_decode( $file );
        if( !$server_config ) return 'https://localhost:5173';
        return $server_config->origin;
    }

    // load script build mode
    private function enqueue_build( $handle, $src, $css_only ){

        if( !isset( $this->manifest->entry_points->$src ) ) return;
        $asset = $this->manifest->entry_points->$src;
        
        $this->enqueue_css( $handle, $asset );
        if( $css_only ) return;
    
        $js_src = $this->url.'dist/'.$asset->file;

        wp_enqueue_script($handle, $js_src, [], null, true);
        
        $this->enqueue_js_filter( $handle );
    }

    // load script dev mode
    private function enqueue_dev( $handle, $src ){
        $src = $this->server_origin.'/'.$src;
        wp_enqueue_script($handle, $src);
        $this->enqueue_js_filter( $handle );
    }

    // load css
    private function enqueue_css( $handle, $asset ){
        if( !isset($asset->css) ) return;
        $i = 0;
        foreach( $asset->css as $src ) { $i++;
            $css_src = $this->url.'dist/'.$src;
            $css_handle = $handle .'-css-'. $i;
            wp_enqueue_style( $css_handle, $css_src );
        }
    }

    // add type="module" to script tag
    private function enqueue_js_filter( $handle ){
        add_filter('script_loader_tag', function( $tag, $js_handle ) use ($handle){
            if( $js_handle !== $handle ) return $tag;
            if( strpos( $tag, ' type="module"' ) === false ) {
                $tag = str_replace('<script', '<script type="module"', $tag);
            }
            return $tag;
        }, 100, 2);
    }
    
    // load script
    public function enqueue( $handle, $src, $css_only = false ){

        if( isset( $GLOBALS[$this->id.'\vite_scripts'] ) &&
            in_array( $src, $GLOBALS[$this->id.'\vite_scripts'] ) ) return;

        $handle = $this->id .'_'. $handle;
        
        if( $this->mode == 'dev' ) {
            $this->enqueue_dev( $handle, $src );
        } else {
            $this->enqueue_build( $handle, $src, $css_only );
        }
    
        $GLOBALS[$this->id.'\vite_scripts'][] = $src;
    }

    public function get_url(){
        return str_replace( $_SERVER['DOCUMENT_ROOT'], get_bloginfo('url'), $this->path) . '/';
    }

    public function normalize_path($path){
        return str_replace('\\', '/', $path);
    }
}