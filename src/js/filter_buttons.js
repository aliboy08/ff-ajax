import { get_el } from './utils';

export default class Filter_Buttons {

    constructor(args){
        
        this.options = {
            container: '',
            items: '',
            multiple: false,
            allow_empty: true,
        };

        Object.keys(args).forEach(key=>{
            this.options[key] = args[key];
        })
        
        this.init();
    }

    init(){
        
        this.container = get_el(this.options.container);
        
        this.items = get_el(this.options.items, true, this.container);

        this.multiple = this.options.multiple ?? false;
        
        this.value = this.multiple ? [] : '';

        this.items.forEach(item=>{

            item.addEventListener('click', ()=>{
                if( this.multiple ) {
                    this.on_click_multiple(item);
                } 
                else {
                    this.on_click_single(item);
                }
            })

            this.check_initial_selected(item);
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

    check_initial_selected(item){

        if( !item.classList.contains('selected') ) return;
        
        if( this.multiple ) {
            this.add_value(item.dataset.value)
        }
        else {
            // single
            this.value = item.dataset.value;
            this.current = item;
        }
    }
    
}