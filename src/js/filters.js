import Filter_Buttons from './filter_buttons';
import Filter_Dropdown from './filter_dropdown';
import Filter_Checkboxes from './filter_checkboxes';
import Filter_Indicators from './filter_indicators';
// import { get_index_key_value, apply_query_string } from './utils';

export default class Filters {

    constructor(options = {}){

        this.options = options;

        if( typeof options.container === 'string') {
            options.container = document.querySelector(options.container);
        }
        this.container = options.container;

        this.query_on_change = this.options.query_on_change ?? true;
        // this.query_strings = this.options.query_strings ?? false;

        this.filter_args = {};
        
        this.init_indicators();
        this.init_fields();
    }

    init_fields(){

        this.fields = [];
        this.custom_filters = {};

        this.init_dropdowns();
        this.init_buttons();
        this.init_checkboxes();
    }

    init_dropdowns(){

        this.container.querySelectorAll('.ff_ajax_filter_dropdown').forEach(field=>{

            this.init_field(field, 'dropdown');

            if( this.with_indicator ) {
                this.indicators.init_field({
                    el: field,
                    on_remove: (value)=>{
                        // on indicator remove, update query
                        this.field_change(field, value);
                    }
                });
            }
            
            field.dropdown = new Filter_Dropdown({
                element: field,
                multiple: field.dataset.multiple ?? false,
                on_change: (value)=>{
                    this.field_change(field, value);
                    // on dropdown change, add indicator
                    if( typeof field.indicator !== 'undefined' ) {
                        field.indicator.update(value);
                    }
                }
            })
        })
    }

    init_buttons(){
        
        this.container.querySelectorAll('.ff_ajax_filter_buttons').forEach(field=>{

            this.init_field(field, 'buttons');
            
            field.filter_buttons = new Filter_Buttons({
                container: field,
                items: 'button',
                multiple: field.dataset.multiple ?? false,
                // query_string: this.query_strings,
                on_change: (value)=>{
                    this.field_change(field, value);
                }
            })
        })
    }

    init_checkboxes(){

        // checkboxes - multiple
        this.container.querySelectorAll('.ff_ajax_filter_checkboxes').forEach(field=>{

            this.init_field(field, 'checkboxes');

            field.checkboxes = new Filter_Checkboxes({
                container: field,
                on_change: (value)=>{
                    this.field_change(field, value);
                }
            })
        })

        // checkbox - single
        this.container.querySelectorAll('.ff_ajax_filter_checkbox').forEach(field=>{

            this.init_field(field, 'checkbox');

            field.addEventListener('change', ()=>{
                this.field_change(field, field.checked ? field.value : '');
            });
        })
    }

    init_field(field, type){
        field.field_type = type;
        field.filter_key = this.get_filter_key(field);
        field.query_type = this.get_query_type(field);
        this.fields.push(field);
    }

    field_change(field, value){
        
        if( 
            !value ||
            typeof value == 'object' && !value.length
        ) {
            // remove
            this.remove_filter(field.filter_key);

            if( this.query_on_change ) {
                this.query();
            }

            return;
        }
        
        // add / update

        let args = {};
        if( field.query_type == 'tax_query' ) {
            // tax_query
            args.taxonomy = field.dataset.taxonomy;
            args.terms = value;
            args.field = field.dataset.taxonomy_field ?? 'slug';
        }
        else {
            // meta_query
            args.key = field.dataset.meta_key;
            args.value = value;

            if( typeof field.dataset.compare !== 'undefined' ) {
                args.compare = field.dataset.compare;
            }

            if( typeof field.dataset.meta_type !== 'undefined' ) {
                args.type = field.dataset.meta_type;
            }
        }

        this.update_filter(field.filter_key, field.query_type, args);

        if( this.query_on_change ) {
            this.query();
        }
    }

    get_filter_key(field){

        if( typeof field.dataset.filter_key !== 'undefined' ) {
            return field.dataset.filter_key;
        }

        if( typeof field.dataset.taxonomy !== 'undefined' ) {
            return field.dataset.taxonomy;
        }

        return field.dataset.meta_key;
    }

    get_query_type(field){

        if( typeof field.dataset.taxonomy !== 'undefined' ) {
            return 'tax_query';
        }

        return 'meta_query';
    }

    query(){

        const ff_ajax = this.options.ff_ajax;
        
        // apply filter query args
        ff_ajax.extra_query_args.filters = this.get_filter_query_args();

        ff_ajax.query_render(data=>{
            if( typeof this.on_query_response === 'function' ) {
                this.on_query_response(data);
            }
        })
    }

    // filter indicators for fields like dropdown multiple
    init_indicators(){

        this.with_indicator = typeof this.options.indicators_container != 'undefined' && this.options.indicators_container != false;

        if( !this.with_indicator ) return;
        
        this.indicators = new Filter_Indicators({
            container: this.options.indicators_container,
            after: this.container,
        });
    }
    
    update_filter(key, type, query_args){

        this.filter_args[key] = {
            type,
            query_args,
        }
        
    }
    
    remove_filter(key){
        if( typeof this.filter_args[key] === 'undefined' ) return;
        delete this.filter_args[key];
    }

    get_filter_query_args(){
        
        const query_args = {
            meta_query: [],
            tax_query: [],
        }
        
        let keys = Object.keys(this.filter_args);

        if( !keys.length ) return query_args;
        
        keys.forEach(key=>{
            let filter = this.filter_args[key];
            query_args[filter.type].push(filter.query_args);
        })

        return query_args;
    }
}