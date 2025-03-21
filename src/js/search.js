import { get_el, create_div } from './utils';

export default class Search {

    constructor(args){

        this.hooks = {
            on_update: [],
        }
        
        this.options = args;
        this.value = null;
        this.last_value = null;
        this.clear_button = null;
        this.submit_timeout = null;

        this.init_input(args);
    }

    init_input(args){

        this.input = get_el(args.field);
        
        let typing_timeout = null;

        this.input.addEventListener('keyup', (e)=>{
            
            clearTimeout(typing_timeout);

            if( e.code.indexOf('Enter') !== -1 ) {
                this.submit_debounce();
                return;
            }

            typing_timeout = setTimeout(()=>this.submit_debounce(), args.timeout_duration ?? 1000);
        })

        this.input.addEventListener('change',()=>this.submit_debounce())
    }

    submit_debounce(){
        clearTimeout(this.submit_timeout);
        this.submit_timeout = setTimeout(()=>this.submit(), 100);
    }

    submit(){
        this.value = this.input.value;
        if( this.last_value === this.value ) return;
        this.last_value = this.value;
        this.init_clear();

        const query_args = this.get_query_args();

        this.hooks.on_update.forEach(action=>action(query_args));
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
        
        this.clear_button = create_div('field_clear');
        this.clear_button.textContent = 'Clear';
        this.input.after(this.clear_button);
    
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
        this.input.value = '';
        this.value = '';
        this.submit();
    }

    get_query_args(){
        const query_args = {};

        if( this.value ) {
            query_args.s = this.value;
        }
        
        return query_args;
    }
}