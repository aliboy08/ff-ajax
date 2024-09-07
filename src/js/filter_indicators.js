class Indicator {
    
    constructor({el, container, on_remove = null}){
        this.el = el;
        this.container = container;
        this.on_remove = on_remove;
        this.key = this.get_key();
        this.multiple = el.dataset.multiple ?? false;
        this.html = this.multiple ? {} : null;

        this.check_initial_selected();
    }

    update(value){

        this.value = value;

        this.el.value = ''; // clear dropdown selection
        
        if( this.multiple ) {
            // multiple
            this.update_multiple();
        }
        else {
            // single
            this.update_single(value);
        }
    }

    get_key(){

        if( this.el.dataset.filter_key ) {
            return this.el.dataset.filter_key;
        }

        if( this.el.dataset.meta_key ) {
            return this.el.dataset.meta_key;
        }

        return this.el.dataset.taxonomy
    }
    
    get_value_label(value){
        for( let i = 0; i < this.el.options.length; i++ ) {
            const option = this.el.options[i];
            if( option.value == value ) {
                return option.text;
            }
        }
    }

    update_single(value){
        
        if( this.html ) {
            // update html

            if( !this.value ) {
                this.html.remove();
                this.html = null;
                return;
            }

            this.update_html(value);
        }
        else {
            // add html

            if( !this.value ) {
                return;
            }

            this.html = this.add_html(value);
        }
    }
    
    update_multiple(){

        console.log('update_multiple', this.value)

        this.value.forEach(value=>{
            if( this.html[value] == 'undefined' || !this.html[value] ) {
                this.html[value] = this.add_html(value);
            }
        })
    }

    add_html(value){

        const label = this.get_value_label(value);

        const indicator = document.createElement('div');
        indicator.classList.add('indicator');

        const text = document.createElement('div');
        text.classList.add('text');
        text.textContent = label;
        indicator.append(text);
        indicator.text = text;

        this.container.append(indicator);
        
        this.init_remove_button(indicator, value);

        return indicator;
    }

    update_html(value){
        this.html.text.textContent = this.get_value_label(value);
    }

    init_remove_button(indicator, value){
        const button = document.createElement('div');
        button.classList.add('remove');
        indicator.append(button);
        button.addEventListener('click',()=>this.remove(indicator, value));
    }

    remove(indicator, value){

        indicator.remove();

        if( this.multiple ) {
            this.html[value] = null;
            this.value.splice( this.value.indexOf(value), 1);
        }
        else {
            // single
            this.html = null;
            this.value = '';
        }
        
        if( typeof this.on_remove == 'function' ) {
            this.on_remove(this.value);
        }
    }

    check_initial_selected(){
        let initial_selected = this.el.dataset.initial_selected;
        if( !initial_selected ) return;

        if( this.multiple ) {
            this.value = initial_selected.split(',');
            this.update_multiple();
        }
        else {
            // single
            this.update_single(initial_selected);
        }
    }
}

export default class Filter_Indicators {

    constructor(options) {
        this.options = options;
        this.init_container();
    }

    init_container(){

        if( this.options.container == 'default' ) {
            // create html
            this.container = document.createElement('div');
            this.container.classList.add('filter_indicators');
            this.options.after.after(this.container);
            return;
        }
    
        if( typeof this.options.container == 'string' ) {
            this.options.container = document.querySelector(this.options.container);
        }

        this.container = this.options.container;
    }

    init_field({ el, on_remove = null }){
        el.indicator = new Indicator({
            el,
            container: this.container,
            on_remove,
        });
    }
}