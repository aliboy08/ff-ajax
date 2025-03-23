import { get_el } from './utils';

import Filters from './filters';
import Load_More from './load_more';
import Search from './search';
import Sort from './sort';

export default class FF_Ajax {

    constructor(args){

        this.hooks = {
            after_render: [],
            after_filter: [],
            modify_query_args: [],
        }

        this.options = args;
        this.container = get_el(args.container);
        this.id = args.id ?? this.container.id;
        this.loop = this.container.querySelector('.loop');
        
        this.init_query(args);
        this.init_filters(args);
        this.init_load_more(args);
        this.init_search(args);
        this.init_sort(args);
        this.init_total_posts_count(args);
    }

    init_query(args){
        
        this.total_posts = 0;

        this.initial_query_args = {...args.query_args};
        this.query_args = {...args.query_args};

        this.extra_query_args = {
            load_more: {},
            filters: {},
            search: {},
            sort: {},
        };

        this.query_timeout = null;
        this.query_timeout_duration = 100;
        this.item_template = args.item_template;
    }
    
    query(on_complete){
        clearTimeout(this.query_timeout);
        this.query_timeout = setTimeout(()=>{
            this.query_final(on_complete);
        }, this.query_timeout_duration);
    }
    
    query_final(on_complete){
        
        const request_time = Date.now();

        const request_data = this.get_query_request_data(request_time);
        
        fetch(ff_ajax_data.ajax_url, {
            method: "POST",
            credentials: 'same-origin',
            body: request_data
        })
        .then((response) => response.json())
        .then((response_data) => {

            // console.log('query:res', response_data)

            if( response_data.request_time < request_time ) {
                // old request, ignore
                return;
            }

            if( typeof this.on_query_response === 'function' ) {
                this.on_query_response(response_data);
            }

            if( typeof on_complete === 'function' ) on_complete(response_data);
        })
        .catch((error) => {
            console.log('ajax error', error)
            // alert(error);
        });
    }

    get_query_request_data(request_time){

        const data = new FormData();
        
        const request_data = {
            action: 'ff_ajax_action',
            nonce: ff_ajax_data.nonce,
            query_args: JSON.stringify(this.get_query_args()),
            total_posts: this.total_posts,
            item_template: this.item_template,
            id: this.id,
            request_time: request_time,
            with_total_posts_count: this.with_total_posts_count,
        }

        if( this.has_extra_query_args() ) {
            request_data.extra_query_args = JSON.stringify(this.extra_query_args);
        }
        
        if( this.options.custom_action ) {
            request_data.custom_action = this.options.custom_action;
        }

        if( this.options.custom_data ) {
            request_data.custom_data = this.options.custom_data;
        }

        for( const key in request_data ) {
            data.append(key, request_data[key]);
        }

        return data;
    }
    
    has_extra_query_args(){
        for( let key in this.extra_query_args ) {
            if( Object.keys(this.extra_query_args[key]) ) {
                return true;
            }
        }
        return false;
    }

    get_query_args(){
        const query_args = {...this.query_args};
        this.hooks.modify_query_args.forEach(action=>action(query_args));
        return query_args;
    }

    render(data, append = false){

        if( !data.html ) {
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

        if( append ) {
            const temp_container = document.createElement('div');
            temp_container.innerHTML = html;
            temp_container.childNodes.forEach(item=>{
                this.loop.append(item.cloneNode(true))
            })
            temp_container.remove();
        }
        else {
            this.loop.innerHTML = html;
        }
        
        this.hooks.after_render.forEach(action=>action(html))
    }
    
    render_no_results(){
        
        let no_results_html = this.options.no_results_html ?? 'No results...';

        this.loop.innerHTML = '<div class="no_results">'+ no_results_html + '</div>';

        this.hooks.after_render.forEach(action=>action(no_results_html))
    }

    query_render(cb = null){

        this.load_more.reset();

        this.loading();

        this.query((data)=>{

            if( typeof cb === 'function' ) cb(data);
            // console.log('query:res', data)
    
            this.render(data);
            this.load_more.toggle(data)
            this.update_total_count(data);
            this.loading_complete();
        });
    }

    loading(){
        this.container.classList.add('loading');
    }

    loading_complete(){
        this.container.classList.remove('loading');
    }

    init_filters(args){

        this.filters_container = args.filters_container ?? this.container;

        const query_on_change = args.query_on_change ?? true;

        this.filters = new Filters({
            container: this.filters_container,
            indicators_container: args.indicators_container ?? 'default',
        });
        
        this.filters.hooks.on_update.push(query_args=>{
            // console.log('filter:update', query_args)
            this.extra_query_args.filters = query_args;
            this.load_more.reset();

            if( query_on_change ) {
                this.query_render(data=>{
                    this.hooks.after_filter.forEach(action=>action(data));
                })
            }
        })
    }

    init_load_more(args){
        
        this.load_more = new Load_More({
            posts_per_page: parseInt(args.query_args.showposts),
            render_after: this.loop, 
            text: args.load_more_text ?? 'Load more',
        });

        this.load_more.hooks.on_update.push((query_args)=>{
            // console.log('load_more:update', query_args)
            this.extra_query_args.load_more = query_args;

            this.query(data=>{
                this.render(data, true);
                this.load_more.toggle(data);
            });
        })

        this.load_more.toggle(args.initial_data)
    }

    init_search(args){

        if( !args.search ?? false ) return;

        const container = get_el(args.search_container ?? this.filters_container);
        const field = container.querySelector('.search_field');
        if( !field ) return;

        this.search = new Search({
            field: field,
            with_clear: field.dataset.with_clear ?? false,
        })
        
        this.search.hooks.on_update.push((query_args)=>{
            // console.log('search:update', query_args)
            this.extra_query_args.search = query_args;
            this.query_render();
        })
    }

    init_sort(args){

        if( !args.sort ) return;

        const container = get_el(args.sort_container ?? this.filters_container);

        this.sort = new Sort({
            field: container.querySelector('.ff_ajax_sort'),
        });

        this.sort.hooks.on_update.push(query_args=>{
            // console.log('sort:update', query_args)
            this.extra_query_args.sort = query_args;
            this.query_render();
        })
    }

    init_total_posts_count(args){

        let total_posts_count = args.total_posts_count ?? null;

        if( !total_posts_count ) {
            this.with_total_posts_count = false;
            return;
        }

        this.with_total_posts_count = true;

        this.total_count_el = document.querySelector(total_posts_count);
    }

    update_total_count(data){
        if( !this.with_total_posts_count ) return;
        if( typeof data.total_posts_count === 'undefined' ) return;
        // console.log('update_total_count', data)
        this.total_count_el.textContent = data.total_posts_count;
    }
}