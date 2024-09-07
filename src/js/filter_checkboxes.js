export default class Filter_Checkboxes {

    constructor(options = {}) {
        this.options = options;
        this.filter_value = [];
        this.init()
    }
    
    init(){

        this.options.container.querySelectorAll('input[type="checkbox"]').forEach(checkbox=>{

            checkbox.addEventListener('change', ()=>{
                
                if( checkbox.checked ) {
                    this.add_value(checkbox.value);
                }
                else {
                    this.remove_value(checkbox.value);
                }
                
                if( typeof this.options.on_change == 'function' ) {
                    this.options.on_change(this.filter_value);
                }
            });

            this.check_initial_selected(checkbox);
        })
        
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

    check_initial_selected(checkbox){
        if( checkbox.checked ) {
            this.add_value(checkbox.value);
        }
    }
}