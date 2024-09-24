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
    
        this.update_extra_query_args();
        this.query();
        this.init_clear();
    }

    update_extra_query_args(){

        const extra_query_args = this.options.ff_ajax.extra_query_args;
        
        if( this.value ) {
            extra_query_args.search = this.value;
        }
        else {
            delete extra_query_args.search;
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

        this.options.ff_ajax.query_render(data=>{
            if( typeof this.on_query_response === 'function' ) {
                this.on_query_response(data);
            }
        })

    }

}