export default class Filter_Dropdown {

    constructor(options = {}) {
        this.options = options;
        this.element = options.element

        this.multiple = options.multiple ?? false;
        this.filter_value = this.multiple ? [] : '';

        this.init_events()
    }
    
    init_events(){

        this.element.addEventListener('change', (e)=>{

            let value = e.target.value

            if( this.multiple ) {

                this.add_value(value);

                // clear selected
                e.target.value = '';
            }
            else {
                this.filter_value = value;
            }

            if( typeof this.options.on_change == 'function' ) {
                this.options.on_change(this.filter_value);
            }
            
        });
    }

    add_value(value){
        if( !value ) return;
        if( this.filter_value.indexOf(value) !== -1 ) return;
        this.filter_value.push(value);
    }

    remove_value(value){
        const index_to_remove = this.filter_value.indexOf(value);
        if( index_to_remove == -1 ) return;
        this.filter_value.splice(index_to_remove, 1);
    }
}