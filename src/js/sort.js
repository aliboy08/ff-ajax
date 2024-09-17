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
        this.update_query_args();
        this.query();
    }

    update_query_args(){

        const query_args = this.options.ff_ajax.query_args;

        if( !this.selected.value ) {
            delete query_args.orderby;
            delete query_args.order;
        }
        else {
            const sort_args = [
                'meta_key',
                'orderby',
                'order',
            ];
            for( let i = 0; i < sort_args.length; i++ ) {
                let sort_arg = this.selected.dataset[sort_args[i]];
                if( typeof sort_arg !== 'undefined' && sort_arg ) {
                    query_args[sort_args[i]] = sort_arg;
                } 
            }
        }
        
    }

    query(){

        this.options.ff_ajax.query_render(data=>{
            if( typeof this.on_query_response === 'function' ) {
                this.on_query_response(data);
            }
        })

        // const ff_ajax = this.options.ff_ajax;

        // ff_ajax.total_posts = 0;
        // ff_ajax.query_args.offset = 0;

        // ff_ajax.container.classList.add('loading');
        // ff_ajax.query((data)=>{
        //     ff_ajax.render_replace(data);
        //     ff_ajax.load_more.update(data)
        //     ff_ajax.container.classList.remove('loading');
        // });
    }

}