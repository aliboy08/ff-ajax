export default class Sort {

    constructor(options){
        this.options = options;
        this.field = options.field;
        this.init_field();
    }
    
    init_field(){

        this.selected = null;

        this.field.addEventListener('change', ()=>{
            var selected_option = this.field.selectedOptions[0];
            if( this.selected == selected_option ) return; // no change
            this.selected = selected_option;
            this.apply_sort();
        });
    }

    apply_sort(){
        this.update_extra_query_args();
        this.query();
    }

    update_extra_query_args(){

        const extra_query_args = this.options.ff_ajax.extra_query_args;

        if( !this.selected.value ) {
            delete extra_query_args.sort;
            return;
        }
        
        const sort_keys = [
            'meta_key',
            'orderby',
            'order',
        ];

        extra_query_args.sort = {};

        for( let i = 0; i < sort_keys.length; i++ ) {
            let sort_arg = this.selected.dataset[sort_keys[i]];
            if( typeof sort_arg !== 'undefined' && sort_arg ) {
                extra_query_args.sort[sort_keys[i]] = sort_arg;
            } 
        }
    
    }

    query(){

        this.options.ff_ajax.query_render(data=>{
            if( typeof this.on_query_response === 'function' ) {
                this.on_query_response(data);
            }
        })

    }

}