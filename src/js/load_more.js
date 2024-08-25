export default class Load_More {
    
    constructor(options){
        this.options = options;
        this.ff_ajax = options.ff_ajax;
        this.enabled = false;
        this.init_button();
        this.initial_check();
    }

    init_button(){
        this.button = document.createElement('div');
        this.button.classList.add('ff_ajax_load_more_btn', 'btn');
        this.button.style.display = 'none';
        this.button.textContent = this.options.text ?? 'Load more';
        this.options.render_after.after(this.button);

        this.button.addEventListener('click', ()=>{
            if( !this.enabled ) return;
            this.query();
        });
    }
    
    show_button(){
        this.enabled = true;
        this.button.style.display = '';
    }

    hide_button(){
        this.enabled = false;
        this.button.style.display = 'none';
    }

    query(){

        const ff_ajax = this.options.ff_ajax;
        
        ff_ajax.query_args.offset = ff_ajax.total_posts;

        ff_ajax.container.classList.add('loading_load_more');
        ff_ajax.query((data)=>{
            ff_ajax.render_append(data);
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