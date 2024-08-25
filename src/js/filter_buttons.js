export default class Filter_Buttons {

    constructor(options){
        
        this.options = {
            container: '',
            items: '',
            is_multiple: false,
            allow_empty: true,
        };

        Object.keys(options).forEach(key=>{
            this.options[key] = options[key];
        })

        this.init();
    }

    init(){
        
        let container = this.options.container;
        if( typeof container == 'string' ) {
            container = document.querySelector(container);
        }
        this.container = container;

        let items = this.options.items;
        if( typeof items == 'string' ) {
            items = container.querySelectorAll(items);
        }
        this.items = items;

        this.is_multiple = this.options.is_multiple;
        
        this.value = this.is_multiple ? [] : '';

        items.forEach(item=>{
            item.addEventListener('click', ()=>{
                if( this.is_multiple ) {
                    this.on_click_multiple(item);
                } 
                else {
                    this.on_click_single(item);
                }
            })
        })
    }

    on_click_single(item){
        
        let is_selected = item.classList.contains('selected');
        
        if( this.options.allow_empty && is_selected ) {
            this.unselect_single(item);

            if( typeof this.options.on_change == 'function' ){
                this.options.on_change(this.value)
            }
            
            return;
        }

        this.unselect_previous();
        
        this.select_single(item);
    }

    on_click_multiple(item){

        item.classList.toggle('selected');

        let is_selected = item.classList.contains('selected');

        let value = item.dataset.value;
        
        if( is_selected ) {
            this.add_value(value);
        }
        else {
            this.remove_value(value);
        }
        
        if( typeof this.options.on_change == 'function' ){
            this.options.on_change(this.value)
        }
    }

    unselect_previous(){
        if( !this.current ) return;
        this.unselect_single(this.current);
    }

    select_single(item){
        item.classList.add('selected');
        this.value = item.dataset.value;
        this.current = item;

        if( typeof this.options.on_change == 'function' ){
            this.options.on_change(this.value)
        }
    }

    unselect_single(item){
        item.classList.remove('selected');
        this.value = '';
        this.current = null;
    }

    add_value(value){
        if( this.value.indexOf(value) !== -1 ) return;
        this.value.push(value);
    }

    remove_value(value){
        let index_to_remove = this.value.indexOf(value);
        if( index_to_remove == -1 ) return;
        this.value.splice(index_to_remove, 1);
    }
    
}