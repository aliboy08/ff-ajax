import { get_el } from './utils';

import Filter_Buttons from './filter_buttons';
import Filter_Dropdown from './filter_dropdown';
import Filter_Checkboxes from './filter_checkboxes';
import Filter_Indicators from './filter_indicators';

export default class Filters {

    constructor(args = {}){
        
        this.hooks = {
            on_update: [],
            on_filter_dropdown_init: [],
            on_filter_dropdown_change: [],
        }

        this.container = get_el(args.container);
        
        this.init_indicators(args);
        this.init_fields();
    }

    init_fields(){

        this.fields = [];

        this.init_dropdowns();
        this.init_buttons();
        this.init_checkboxes();
    }

    update(){
        const query_args = this.get_query_args();
        this.hooks.on_update.forEach(action=>action(query_args));
    }

    init_dropdowns(){

        this.container.querySelectorAll('.ff_ajax_filter_dropdown').forEach(field=>{

            this.init_field(field, 'dropdown');

            this.hooks.on_filter_dropdown_init.forEach(action=>action(field))
            
            field.dropdown = new Filter_Dropdown({
                element: field,
                multiple: field.dataset.multiple ?? false,
                on_change: (value)=>{
                    field.filter_value = value;
                    this.update();
                    this.on_filter_dropdown_change.forEach(action=>action(value, field))
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
                on_change: (value)=>{
                    field.filter_value = value;
                    this.update();
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
                    field.filter_value = value;
                    this.update();
                }
            })
        })

        // checkbox - single
        this.container.querySelectorAll('.ff_ajax_filter_checkbox').forEach(field=>{

            this.init_field(field, 'checkbox');

            field.addEventListener('change', ()=>{
                field.filter_value = field.checked ? field.value : '';
                this.update();
            });
        })
    }

    init_field(field, type){

        const multiple = field.dataset.multiple ?? false;

        field.field_type = type;
        field.filter_key = this.get_filter_key(field);
        field.query_type = this.get_query_type(field);
        field.filter_value = multiple ? [] : '';
        
        this.fields.push(field);
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

    // filter indicators for fields like dropdown multiple
    init_indicators(args){
        
        if( typeof args.indicators_container === 'undefined' ) return;
        if( !args.indicators_container ) return;
        
        const indicators = new Filter_Indicators({
            container: args.indicators_container,
            after: this.container,
        });
        
        this.hooks.on_filter_dropdown_init.push(field=>{
            indicators.init_field({
                el: field,
                on_remove: (value)=>{
                    field.filter_value = value;
                    this.update();
                }
            });
        })

        this.hooks.on_filter_dropdown_change.push((value, field)=>{
            if( typeof field.indicator !== 'undefined' ) {
                field.indicator.update(value);
            }
        })
        
        this.indicators = indicators;
    }

    get_query_args(){

        const query_args = {};

        const add_clause = {
            tax_query: add_clause_tax,
            meta_query: add_clause_meta
        }
        
        this.fields.forEach(field=>{
            if( !has_value(field) ) return;
            const type = field.dataset.query_type;
            add_clause[type](field, query_args);
        })
        
        return query_args;
    }

    have_filters(){
        for( const field of this.fields ) {
            if( has_value(field) ) {
                return true;
            } 
        }
        return false;
    }
}

function has_value(field) {
    if( Array.isArray(field.filter_value) ) {
        return field.filter_value.length;
    }
    return field.filter_value;
}

function add_unqiue(value, arr){

    if( Array.isArray(value) ) {
        value.forEach(value_item=>{
            if( !arr.includes(value_item) ) {
                arr.push(value_item)
            }
        })
        return;
    }

    if( !arr.includes(value) ) {
        arr.push(value)
    }
}

function get_existing_tax_clause(field, query_args){
    for( const clause of query_args.tax_query ) {
        if( clause.filter_key === field.filter_key ) {
            return clause;
        }
    }
    return null;
}

function add_clause_tax(field, query_args){
    
    if( typeof query_args.tax_query === 'undefined' ) {
        query_args.tax_query = [];
    }
    
    const existing_clause = get_existing_tax_clause(field, query_args);
    if( existing_clause !== null ) {
        add_unqiue(field.value, existing_clause.terms);
        return;
    }

    query_args.tax_query.push({
        taxonomy: field.dataset.taxonomy,
        field: field.dataset.taxonomy_field ?? 'slug',
        terms: field.filter_value,
        filter_key: field.filter_key,
    })
}

function add_clause_meta(field, query_args){

    if( typeof query_args.meta_query === 'undefined' ) {
        query_args.meta_query = [];
    }

    let meta_compare = Array.isArray(field.value) ? 'IN' : '=';
    if( typeof field.dataset.meta_compare !== 'undefined' && dataset.meta_compare ) {
        meta_compare = field.dataset.meta_compare;
    }

    query_args.meta_query.push({
        key: field.dataset.meta_key,
        compare: meta_compare,
        type: field.dataset.meta_type ?? 'CHAR',
        value: field.filter_value,
    })
}