<?php
class FF_Ajax {
    
    public $settings = [];
    public $query = [];

    public function __construct($settings){

        $this->settings = $settings;

        $default_settings = [
            'initial_query' => false,
            'filter_on_load' => false,
            'query_on_change' => true,
            'load_more_text' => 'Load more',
            'no_results_html' => 'No results found, try different filters',
        ];
        foreach( $default_settings as $key => $value ) {
            if(isset( $this->settings[$key] )) continue;
            $this->settings[$key] = $value;
        }

        // normalize path - fix for windows path
        $this->settings['item_template'] = str_replace('\\', '/', $this->settings['item_template']);

        $this->initial_query();
        
    }

    public function initial_query(){

        if( !$this->settings['initial_query'] ) return;
            
        $this->query = new WP_Query($this->settings['query_args']);
        
        // initial check have more posts
        $this->settings['initial_data'] = [
            'count' => $this->query->post_count,
            'have_more_posts' => ff_ajax_have_more_posts($this->settings['query_args'], $this->query->post_count),
        ];
    }
    
    public function render(){
        
        global $ff_ajax;
        $ff_ajax->enqueue();
        
        // wp_enqueue_script('ff-ajax');

        if( $this->settings['initial_query'] ) {

            echo '<div class="loop">';
            foreach( $this->query->posts as $post ) {
                include $this->settings['item_template'];
            }
            echo '</div>';

        }
        else {
            echo '<div class="loop"><div class="loading_text">Loading...</div></div>';
        }
       
    }
    
    public function have_more_posts($args, $offset) {
        return ff_ajax_have_more_posts($args, $offset);
    }
    
    public function filter_dropdown($args){

        $type = isset($args['meta_key']) ? 'meta_query' : 'tax_query';
        $args['query_type'] = $type;

        $selected = isset($args['selected']) ? $args['selected'] : '';
        $placeholder = $this->get_placeholder($args);
        $choices = $this->get_choices($args);
        $attr = $this->get_filter_attr($args);
        $add_class = isset($args['class']) ? ' '.$args['class'] : '';

        echo '<div class="filter-con'. $add_class .'">';

            if( isset($args['label']) ) {
                echo '<span class="label">'. $args['label'] .'</span>';
            }

            echo '<select class="ff_ajax_filter ff_ajax_filter_dropdown"'. $attr .'>';
                echo '<option value="">'. $placeholder .'</option>';
                foreach( $choices as $choice_value => $choice_label ) {
                    $is_selected = $selected == $choice_value ? ' selected' : ''; 
                    echo '<option value="'. $choice_value .'"'. $is_selected .'>'. $choice_label .'</option>';
                }
            echo '</select>';
        echo '</div>';
    }

    public function filter_input($args){
        $type = isset($args['meta_key']) ? 'meta_query' : 'tax_query';

        $args['query_type'] = $type;

        $placeholder = $this->get_placeholder($args);
        $attr = $this->get_filter_attr($args);

        $add_class = isset($args['class']) ? ' '.$args['class'] : '';
        echo '<div class="filter-con'. $add_class .'">';
            if( isset($args['label']) ) {
                echo '<span class="label">'. $args['label'] .'</span>';
            }
            echo '<input type="text" placeholder="'. $placeholder .'" class="ff_ajax_filter"'. $attr .'>';
        echo '</div>';
    }

    public function filter_checkbox($args){
        $type = isset($args['meta_key']) ? 'meta_query' : 'tax_query';
        $args['query_type'] = $type;

        $is_checked = isset($args['checked']) ? ' checked' : '';

        $label = $args['label'] ?? $args['meta_key'] ?? $args['taxonomy'];

        $add_class = $this->get_class($args);
        $attr = $this->get_filter_attr($args);

        echo '<div class="filter-con '. $add_class .'">';
            echo '<label><input type="checkbox" class="ff_ajax_filter ff_ajax_filter_checkbox"'. $attr .' value="1"'. $is_checked .'>'. $label .'</label>';
        echo '</div>';
    }

    public function filter_checkboxes($args){
        $type = isset($args['meta_key']) ? 'meta_query' : 'tax_query';
        $args['query_type'] = $type;

        $selected = isset($args['selected']) ? $args['selected'] : [];
        if( is_string($selected) && $selected ) {
            $selected = [$selected];
        }

        $add_class = $this->get_class($args);
        $attr = $this->get_filter_attr($args);
        $choices = $this->get_choices($args);

        echo '<div class="filter-con ff_ajax_filter_checkboxes '. $add_class .'"'. $attr .'>';
            foreach( $choices as $choice_value => $choice_label ) {
                $is_selected = in_array( $choice_value, $selected) ? ' checked' : '';
                echo '<div class="checkbox">';
                    echo '<label><input type="checkbox" value="'. $choice_value .'"'. $is_selected .'>'. $choice_label .'</label>';
                echo '</div>';
            }
        echo '</div>';
    }

    public function filter_buttons($args){

        $type = isset($args['meta_key']) ? 'meta_query' : 'tax_query';

        $args['query_type'] = $type;

        $selected = isset($args['selected']) ? $args['selected'] : [];
        if( is_string($selected) && $selected ) {
            $selected = [$selected];
        }
        
        $attr = $this->get_filter_attr($args);
        $add_class = $this->get_class($args);
        $choices = $this->get_choices($args);

        echo '<div class="filter-con ff_ajax_filter_buttons '. $add_class .'"'. $attr .'>';
        foreach( $choices as $choice_value => $choice_label ) {
            $is_selected = in_array( $choice_value, $selected) ? ' selected' : ''; 
            echo '<button data-value="'. $choice_value .'" class="'. $is_selected .'">'. $choice_label .'</button>';
        }
        echo '</div>';
    }

    public function search_field($args){
        $this->settings['search'] = true;
        $placeholder = $args['placeholder'] ?? 'Search';
        $attr = $this->get_html_attr($args, ['with_clear']);
        echo '<div class="filter-con ff_ajax_search_con">';
            echo '<input type="search" placeholder="'. $placeholder .'" class="search_field"'. $attr .'>';
        echo '</div>';
    }

    public function sort_dropdown($args){

        $selected = isset($args['selected']) ? $args['selected'] : '';
        $placeholder = $this->get_placeholder($args);
        if( $placeholder == 'Filter' ) $placeholder = 'Sort';
        $add_class = isset($args['class']) ? ' '.$args['class'] : '';

        $this->settings['sort'] = true;

        echo '<div class="filter-con'. $add_class .'">';

            if( isset($args['label']) ) {
                echo '<span class="label">'. $args['label'] .'</span>';
            }

            $choice_attr_keys = [
                'meta_key',
                'orderby',
                'order',
            ];
            echo '<select class="ff_ajax_sort">';
                echo '<option value="">'. $placeholder .'</option>';
                foreach( $args['choices'] as $choice ) {
                    $is_selected = $selected == $choice['label'] ? ' selected' : '';
                    $choice_attr = $this->get_html_attr($choice, $choice_attr_keys);
                    echo '<option value="'. $choice['label'] .'"'. $is_selected .''. $choice_attr .'>'. $choice['label'] .'</option>';
                }
            echo '</select>';
        echo '</div>';
    }

    public function get_class($args){

        $field_key = $args['filter_key'] ?? '';
        if( !$field_key ) {
            $field_key = $args['meta_key'] ?? $args['taxonomy'];
        }

        $class = 'filter_field_'. $field_key;

        if( isset( $args['class'] ) ) {
            $class = ' '. $args['class'];
        }

        return $class;
    }

    public function get_choices($args){

        if( isset($args['choices']) ) {
            return $args['choices'];
        }
        
        // choices not set
        // if taxonomy, get terms
        $choices  = [];
        if( isset($args['taxonomy']) ) {
            $terms = get_terms([
                'taxonomy' => $args['taxonomy'],
            ]);
            if( $terms ) {
                $exclude = isset($args['exclude']) ? $args['exclude'] : [];
                foreach( $terms as $term ) {
                    if( in_array($term->slug, $exclude) ) continue;
                    $choices[$term->slug] = $term->name;
                }
            }
        }

        return $choices;
    }

    public function get_placeholder($args){
        
        if( isset($args['placeholder']) ) {
            return $args['placeholder'];
        }

        // fallback
        if( isset($args['label']) ) {
            return 'Select';
        }

        if( isset($args['meta_key']) ) {
            return str_replace('_', ' ', ucfirst($args['meta_key']));
        }

        if( isset($args['taxonomy']) ) {
            return str_replace('_', ' ', ucfirst($args['taxonomy']));
        }

        return 'Filter';
    }

    public function get_filter_attr($args){
        $type = $args['query_type'];

        if( isset($args['meta_key']) && isset($args['multiple']) ) {
            $args['compare'] = 'IN';
        }

        $attr = [
            'query_type' => $type,
        ];
        $attr_mapping = [
            'meta_query' => [
                'meta_key',
                'meta_type',
                'compare',
            ],
            'tax_query' => [
                'taxonomy',
                'taxonomy_field',
            ],
            'common' => [
                'filter_key',
                'multiple',
                'indicator_prefix',
            ],
        ];
        foreach( $attr_mapping[$type] as $key ) {
            if( isset($args[$key]) ) $attr[$key] = $args[$key];
        }

        foreach( $attr_mapping['common'] as $key ) {
            if( isset($args[$key]) ) $attr[$key] = $args[$key];
        }

        $html_attr = '';
        foreach( $attr as $attr_key => $attr_value ) {
            $html_attr .= ' data-'.$attr_key.'="'. $attr_value .'"';
        }

        return $html_attr;
    }

    public function get_html_attr($args, $attr_keys){
        $attr = [];
        foreach( $args as $key => $value ) {
            if( !in_array( $key, $attr_keys ) ) continue;
            $attr[$key] = $value;
        }
        $html_attr = '';
        foreach( $attr as $attr_key => $attr_value ) {
            $html_attr .= ' data-'.$attr_key.'="'. $attr_value .'"';
        }
        return $html_attr;
    }

    public function settings_attr(){
        return 'data-settings="'. htmlspecialchars(json_encode($this->settings), ENT_QUOTES, 'UTF-8') .'"';
    }

}