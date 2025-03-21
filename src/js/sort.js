export default class Sort {

    constructor(args){

        this.hooks = {
            on_update: [],
        }

        this.options = args;
        this.field = args.field;
        this.init_field();
    }
    
    init_field(){

        this.selected = null;

        this.field.addEventListener('change', ()=>{

            const selected_option = this.field.selectedOptions[0];
            if( this.selected === selected_option ) return; // no change
            this.selected = selected_option;

            this.update();
        });
    }

    update(){
        const query_args = this.get_query_args();
        this.hooks.on_update.forEach(action=>action(query_args));
    }

    get_query_args(){
        
        const args_keys = [
            'meta_key',
            'orderby',
            'order',
        ];
        
        const query_args = {};

        for( let i = 0; i < args_keys.length; i++ ) {
            const arg_value = this.selected.dataset[args_keys[i]];
            if( typeof arg_value !== 'undefined' && arg_value ) {
                query_args[args_keys[i]] = arg_value;
            } 
        }

        return query_args;
    }
}