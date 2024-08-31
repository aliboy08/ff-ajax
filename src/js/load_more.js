export default class Load_More {
    
    constructor(options){
        this.options = options;
        this.ff_ajax = options.ff_ajax;
        this.enabled = false;
        this.init_button();
        this.initial_check();
    }

    init_button(){

        this.container = document.createElement('div');
        this.container.classList.add('ff_ajax_load_more_container');
        this.container.style.display = 'none';
        this.options.render_after.after(this.container);

        this.button = document.createElement('div');
        this.button.classList.add('btn');
        this.button.textContent = this.options.text ?? 'Load more';
        this.container.append(this.button);

        this.button.addEventListener('click', ()=>{
            if( !this.enabled ) return;
            this.query();
        });
    }
    
    show_button(){
        this.enabled = true;
        this.container.style.display = '';
    }

    hide_button(){
        this.enabled = false;
        this.container.style.display = 'none';
    }

    query(){

        const ff_ajax = this.options.ff_ajax;
        
        ff_ajax.query_args.offset = ff_ajax.total_posts;

        this.button.classList.add('loading');
        ff_ajax.container.classList.add('loading_load_more');
        ff_ajax.query((data)=>{
            ff_ajax.render_append(data);
            this.button.classList.remove('loading');
            ff_ajax.container.classList.remove('loading_load_more');
            this.update(data)
        });
    }

    update(data){

        this.ff_ajax.total_posts = data.total_posts;

        if( data.have_more_posts ) {
            this.show_button();
        }
        else {
            this.hide_button();
        }
    }

    initial_check(){
        if( !this.ff_ajax.options.initial_data.have_more_posts ) return;
        this.ff_ajax.total_posts = this.ff_ajax.options.initial_data.count;
        this.show_button();
    }

}