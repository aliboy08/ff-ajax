export default class Search {

    constructor(options){
        this.options = options;
        this.ff_ajax = options.ff_ajax;
        this.timeout = null;
        this.timeout_duration = options.timeout_duration ?? 1000;
        this.last_value = null;
        this.clear_button = null;
        this.init_field();
    }

    init_field(){

        this.field = this.options.field;
        if( typeof this.field == 'string' ) {
            this.field = document.querySelector(this.field);
        }

        this.field.addEventListener('keyup', (e)=>{
            
            clearTimeout(this.timeout);

            if( e.code.indexOf('Enter') !== -1 ) {
                this.submit(e.target.value);
                return;
            }

            this.timeout = setTimeout(()=>{
                this.submit(e.target.value);
            }, this.timeout_duration);

        })
    }

    submit(value){

        if( this.last_value == value ) return;

        this.last_value = value;
        this.value = value;
    
        this.update_query_args();
        this.query();
        this.init_clear();
    }

    update_query_args(){

        if( this.value ) {
            this.ff_ajax.query_args.s = this.value;
        }
        else {
            delete this.ff_ajax.query_args.s;
        }
    }

    init_clear(){

        if( !this.options.with_clear ) return;

        if( this.value && !this.clear_button ) {
            this.clear_button_add();
        }
        else if( !this.value && this.clear_button ){
            this.clear_button_remove();
        }
    }

    clear_button_add(){
        
        this.clear_button = document.createElement('div');
        this.clear_button.textContent = 'Clear';
        this.clear_button.classList.add('field_clear');
        this.field.after(this.clear_button);
    
        this.clear_button.addEventListener('click', ()=>{
            this.clear();
        });
    }

    clear_button_remove(){
        if( !this.clear_button ) return;
        this.clear_button.remove();
        this.clear_button = null;
    }

    clear(){
        this.clear_button_remove();
        this.field.value = '';
        this.value = '';
        this.submit();
    }

    query(){
        const ff_ajax = this.options.ff_ajax;

        ff_ajax.total_posts = 0;
        ff_ajax.query_args.offset = 0;

        ff_ajax.container.classList.add('loading');
        ff_ajax.query((data)=>{

            if( typeof this.on_query_response === 'function' ) {
                this.on_query_response(data);
            }
            
            ff_ajax.render_replace(data);
            ff_ajax.load_more.update(data)
            ff_ajax.container.classList.remove('loading');
        });
    }

}

