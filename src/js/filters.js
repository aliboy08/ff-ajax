import Filter_Buttons from './filter_buttons';
import Filter_Dropdown from './filter_dropdown';
import Filter_Checkboxes from './filter_checkboxes';
import { get_index_key_value } from './utils';

export default class Filters {

    constructor(options = {}){

        this.options = options;

        if( typeof options.container === 'string') {
            options.container = document.querySelector(options.container);
        }
        this.container = options.container;

        this.query_on_change = this.options.query_on_change ?? true;
        this.filter_on_load = this.options.filter_on_load ?? true;

        this.query_args = options.query_args;
        
        this.init_fields();
        this.init_reset();
    }

    init_fields(){

        this.fields = [];
        
        this.init_dropdowns();
        this.init_buttons();
        this.init_checkboxes();
    }

    init_dropdowns(){

        this.container.querySelectorAll('.ff_ajax_filter_dropdown').forEach(field=>{

            field.filter_type = 'dropdown';
            this.fields.push(field);

            field.dropdown = new Filter_Dropdown({
                element: field,
                multiple: field.dataset.multiple ?? false,
                on_change: (value)=>{
                    field.filter_value = value;
                    this.update_query_args(field);
                }
            })
        })
    }

    init_buttons(){
        
        this.container.querySelectorAll('.ff_ajax_filter_buttons').forEach(field=>{
            
            field.filter_type = 'buttons';
            this.fields.push(field);
            
            field.filter_buttons = new Filter_Buttons({
                container: field,
                items: 'button',
                is_multiple: field.is_multiple,
                on_change: (value)=>{
                    field.filter_value = value;
                    this.update_query_args(field);
                }
            })
        })
    }

    init_checkboxes(){

        // checkboxes - multiple
        this.container.querySelectorAll('.ff_ajax_filter_checkboxes').forEach(field=>{

            field.filter_type = 'checkboxes';
            this.fields.push(field);

            field.checkboxes = new Filter_Checkboxes({
                container: field,
                on_change: (value)=>{
                    field.filter_value = value;
                    this.update_query_args(field);
                }
            })
        })

        // checkbox - single
        this.container.querySelectorAll('.ff_ajax_filter_checkbox').forEach(field=>{
        
            field.filter_type = 'checkbox';
            this.fields.push(field);

            field.addEventListener('change', ()=>{
                field.filter_value = field.checked ? field.value : '';
                this.update_query_args(field);
            });
        })
    }
    
    update_query_args(field){
        
        const args = this.get_field_query_args(field);

        this.apply_query_args(args);

        if( this.query_on_change ) {
            this.query();
        }
    }

    get_field_query_args(field){

        if( field.dataset.query_type == 'tax_query' ) {

            return {
                taxonomy: field.dataset.taxonomy,
                terms: field.filter_value,
                field: field.dataset.taxonomy_field ?? 'slug',
                filter_key: field.dataset.filter_key ?? field.dataset.taxonomy,
            }

        }
        else if( field.dataset.query_type == 'meta_query' ) {

            return {
                key: field.dataset.meta_key,
                value: field.filter_value,
                type: field.dataset.meta_type ?? 'CHAR',
                compare: field.dataset.compare ?? '=',
                filter_key: field.dataset.filter_key ?? field.dataset.meta_key
            }
        }
    }
    
    apply_query_args(args){

        const type = typeof args.taxonomy !== 'undefined' ? 'tax_query' : 'meta_query';

        if( typeof this.query_args[type] === 'undefined' ) {
            // does not exist yet, add
            this.query_args[type] = [];
            this.query_args[type].push(args);
            return;
        }
        
        const query_type = this.query_args[type];

        let search_key = 'filter_key';
        let search_value = args.filter_key;
        if( !args.filter_key ) {
            search_key = type == 'tax_query' ? 'taxonomy' : 'key';
            search_value = type == 'tax_query' ? args.taxonomy : args.key;
        }

        const filter_index = get_index_key_value(search_key, search_value, query_type);
        
        const value_key = type == 'tax_query' ? 'terms' : 'value';

        const query_value = args[value_key];

        if( filter_index === false ) {
            // filter not found, add
            if( !query_value ) return;
            query_type.push(args);
        }
        else {
            // filter found
            if( !query_value || !query_value.length) {
                // remove
                query_type.splice(filter_index, 1);
            } else {
                // update existing
                query_type[filter_index][value_key] = query_value;
            }
        }
    }
    
    init_reset(){
        this.initial_query_args = {...this.options.query_args}
    }

    remove_filter_value(value, field){
        const index_to_remove = field.filter_value.indexOf(value);
        if( index_to_remove == -1 ) return;
        field.filter_value.splice(index_to_remove, 1);
    }

    query(){
        const ff_ajax = this.options.ff_ajax;

        ff_ajax.total_posts = 0;
        ff_ajax.query_args.offset = 0;

        ff_ajax.container.classList.add('loading');
        ff_ajax.query((data)=>{
            ff_ajax.render_replace(data);
            ff_ajax.load_more.update(data)
            ff_ajax.container.classList.remove('loading');
        });
    }

}