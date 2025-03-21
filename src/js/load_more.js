import { create_div } from './utils';

export default class Load_More {
    
    constructor(args){

        this.hooks = {
            on_update: [],
        }

        this.posts_per_page = args.posts_per_page;
        this.page = 1;

        this.init_button(args);
    }

    init_button(args){

        this.container = create_div('ff_ajax_load_more_container');
        this.container.style.display = 'none';
        args.render_after.after(this.container);

        this.button = create_div('btn', this.container, args.text ?? 'Load more');
        this.button.addEventListener('click', ()=>this.update());
    }

    update(){
        this.loading();
        const query_args = this.get_query_args();
        this.hooks.on_update.forEach(action=>action(query_args));
        this.page++;
    }
    
    show(){
        this.container.style.display = '';
    }

    hide(){
        this.container.style.display = 'none';
    }

    toggle(data){
        this[data.have_more_posts ? 'show' : 'hide']();
    }

    loading(){
        this.button.classList.add('loading');
        this.button.style.pointerEvents = 'none';
    }

    loading_complete(){
        this.button.classList.remove('loading');
        this.button.style.pointerEvents = '';
    }

    reset(){
        this.page = 1;
    }

    get_query_args(){
        const query_args = {};

        const offset = this.page * this.posts_per_page;
        query_args.offset = offset;

        return query_args;
    }
}