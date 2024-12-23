import Filters from './filters';
import Load_More from './load_more';
import Search from './search';
import Sort from './sort';

export default class FF_Ajax {

    constructor(options){
        
        this.options = options;

        this.container = typeof options.container === 'string' ? document.querySelector(options.container) : options.container;

        this.loop = this.container.querySelector('.loop');

        this.hooks = {
            after_render: [],
        }

        this.extra_query_args = {};

        this.init_query();
        this.init_filters();
        this.init_load_more();
        this.init_search();
        this.init_sort();
        this.init_total_posts_count();
    }

    init_query(){
        this.total_posts = 0;
        this.query_args = this.options.query_args;
        this.query_timeout = null;
        this.query_timeout_duration = 100;
        this.item_template = this.options.item_template;
        
        this.request_time = null;
    }
    
    init_filters(){

        this.filters_container = this.options.filters_container ?? this.container;

        this.filters = new Filters({
            ff_ajax: this,
            container: this.filters_container,
            query_on_change: this.options.query_on_change ?? true,
            indicators_container: this.options.indicators_container ?? 'default',
            query_strings: this.options.query_strings ?? false,
        });
    }
    
    query(on_complete){
        clearTimeout(this.query_timeout);
        this.query_timeout = setTimeout(()=>{
            this.query_final(on_complete);
        }, this.query_timeout_duration);
    }

    query_final(on_complete){
        
        this.request_time = Date.now();

        const data = new FormData();

        data.append('action', 'ff_ajax_action');
        data.append('nonce', ff_ajax_data.nonce);
        data.append('query_args', JSON.stringify(this.query_args));
        data.append('total_posts', this.total_posts);
        data.append('item_template', this.item_template);
        data.append('id', this.options.id);
        
        if( typeof this.custom_filters !== 'undefined' ) {
            if( typeof this.custom_filters === 'object' ) {
                this.custom_filters = JSON.stringify(this.custom_filters);
            }
            data.append('custom_filters', this.custom_filters);
        }

        data.append('extra_query_args', JSON.stringify(this.extra_query_args));

        data.append('request_time', this.request_time);
        
        if( typeof this.options.custom_action !== 'undefined' && this.options.custom_action ) {
            data.append('custom_action', this.options.custom_action);
        }

        if( typeof this.options.custom_data !== 'undefined' ) {
            data.append('custom_data', this.options.custom_action);
        }
        
        data.append('with_total_posts_count', this.with_total_posts_count);
        
        fetch(ff_ajax_data.ajax_url, {
            method: "POST",
            credentials: 'same-origin',
            body: data
        })
        .then((response) => response.json())
        .then((data) => {

            if( data.request_time < this.request_time ) {
                // old request, ignore
                return;
            }

            if( typeof this.on_query_response === 'function' ) {
                this.on_query_response(data);
            }

            if( typeof on_complete == 'function' ) on_complete(data);
        })
        .catch((error) => {
            console.log('ajax error', error)
            // alert(error);
        });
    }
    
    render_replace(data){
        
        if( !data.total_posts ) {
            this.render_no_results();
            return;
        }

        let html = data.html;

        if( typeof this.before_render === 'function' ) {
            this.before_render(html);
        }

        if( typeof this.before_render_modify_html === 'function' ) {
            html = this.before_render_modify_html(html);
        }

        this.loop.innerHTML = html;
        
        this.hooks.after_render.forEach(action=>action(html))
    }

    render_append(data){
        
        if( !data.total_posts ) {
            this.render_no_results();
            return;
        }

        let html = data.html;

        if( typeof this.before_render === 'function' ) {
            this.before_render(html);
        }

        if( typeof this.before_render_modify_html === 'function' ) {
            html = this.before_render_modify_html(html);
        }

        const temp_container = document.createElement('div');
	    temp_container.innerHTML = html;
        temp_container.childNodes.forEach(item=>{
            this.loop.append(item.cloneNode(true))
        })
        temp_container.remove();
        
        this.hooks.after_render.forEach(action=>action(html))
    }

    render_no_results(){
        
        let no_results_html = this.options.no_results_html ?? 'No results...';

        this.loop.innerHTML = '<div class="no_results">'+ no_results_html + '</div>';

        this.hooks.after_render.forEach(action=>action(html))
    }

    query_render(cb = null){

        this.total_posts = 0;
        this.query_args.offset = 0;
        
        this.container.classList.add('loading');
        this.query((data)=>{

            if( typeof cb === 'function' ) {
                cb(data);
            }
    
            this.render_replace(data);
            this.load_more.update(data)
            this.container.classList.remove('loading');
            this.render_total_posts_count(data);
        });
    }

    init_load_more(){
        this.load_more = new Load_More({
            ff_ajax: this,
            render_after: this.loop, 
            text: this.options.load_more_text ?? 'Load more',
        });
    }

    init_search(){

        if( !this.options.search ?? false) return;

        let search_container = this.options.search_container ?? this.filters_container;

        if( typeof search_container == 'string' ) {
            search_container = document.querySelector(search_container)
        }

        let field = search_container.querySelector('.search_field');
        if( !field ) return;

        this.search = new Search({
            ff_ajax: this,
            field: field,
            with_clear: field.dataset.with_clear ?? false,
        })
    }

    init_sort(){

        if( !this.options.sort ?? false ) return;

        let sort_container = this.options.sort_container ?? this.filters_container;

        if( typeof sort_container == 'string' ) {
            sort_container = document.querySelector(sort_container)
        }

        let field = sort_container.querySelector('.ff_ajax_sort');

        this.sort = new Sort({
            ff_ajax: this,
            field,
        });
    }

    init_total_posts_count(){

        let total_posts_count = this.options.total_posts_count ?? null;

        if( !total_posts_count ) {
            this.with_total_posts_count = '';
            return;
        }

        this.with_total_posts_count = 1;

        this.total_posts_count_el = document.querySelector(total_posts_count);
    }

    render_total_posts_count(data){
        if( !this.with_total_posts_count ) return;
        if( typeof data.total_posts_count === 'undefined' ) return;
        this.total_posts_count_el.textContent = data.total_posts_count;
    }
    
}