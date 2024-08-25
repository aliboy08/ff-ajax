function FF_Ajax(options){
    var _ = this;
    _.options = options;
    _.action = options.action ?? '';
    _.query_args = options.query_args;
    _.item_template = options.item_template;
    _.total_posts = 0;
    _.load_more_button = null;
    _.type = 'default';
    _.query_on_change = options.query_on_change ?? true;
    _.filter_on_load = options.filter_on_load ?? false;
    _.query_throttle = null;
    _.query_throttle_time = 100;
    
    _.container = options.container;
    if( typeof _.container === 'string' ) {
        _.container = document.querySelector(_.container);
    }

    _.loop = _.container.querySelector('.loop');

    _.init();
    console.log(options);
}

FF_Ajax.prototype.init = function(){
    this.filters_init();
    this.filter_buttons_init();
    this.filter_checkboxes_init();
    this.search_init();
    this.sort_init();
    this.initial_load();
}

FF_Ajax.prototype.initial_load = function(){
    
    var _ = this;

    if( _.filter_on_load ) {
        _.filters_update();
    }
    // else if( _.loop.classList.contains('load_initial') ) {
    //     _.loop.classList.remove('load_initial');
    //     _.query();
    // }
    // else if ( typeof _.loop.dataset.loadMore !== 'undefined' ) {
    //     _.update_load_more({ total_posts: _.loop.dataset.loadMore, have_more_posts: true });
    //     _.loop.removeAttribute('data-load-more');
    // }
}

FF_Ajax.prototype.query = function(cb){
    var _ = this;
    clearTimeout(_.query_throttle);
    _.query_throttle = setTimeout(function(){
        _.query_final(cb);
    }, _.query_throttle_time);
}

FF_Ajax.prototype.query_final = function(cb){
    var _ = this;

    var data = {
        action: 'ff_ajax_action',
        nonce: ff_ajax_data.nonce,
        ajax_action: _.action,
        query_args: _.query_args,
        total_posts: _.total_posts,
        item_template: _.item_template,
        custom_data: _.options.custom_data,
    }

    if( typeof _.options.custom_query !== 'undefined' ) {
        data.custom_query = 1;
    }

    jQuery.ajax({
        url: ff_ajax_data.ajax_url,
        type: "post",
        data: data,
        dataType : "json",
    })
    .done(function(res){
        // console.log('query result', res);
        _.render(res);
        _.update_load_more(res);
    })
    .always(function(res){
        if( typeof cb == 'function' ) cb(res);
    })
}

// vanilla
// FF_Ajax.prototype.render = function(res){
//     var _ = this;
//     if( _.type == 'load_more' ) {
//         _.container.innerHTML += res.html;
//     }
//     else {
//         _.container.innerHTML = res.html;
//     }
// }

FF_Ajax.prototype.render = function(res){
    var _ = this;

    if( !res.total_posts ) {
        jQuery(_.loop).html('<div class="no_results">'+ _.options.no_results_html ?? 'No results...' + '</div>');

        if( typeof _.after_render === 'function' ) {
            _.after_render(html);
        }

        return;
    }
    
    var html = jQuery(res.html);
    
    if( typeof _.before_render === 'function' ) {
        _.before_render(html);
    }

    if( typeof _.before_render_modify_html === 'function' ) {
        html = _.before_render_modify_html(html);
    }

    if( _.type == 'load_more' ) {
        jQuery(_.loop).append(html);
    }
    else {
        jQuery(_.loop).html(html);
    }

    if( typeof _.after_render === 'function' ) {
        _.after_render(html);
    }
}

FF_Ajax.prototype.update_load_more = function(res){
    var _ = this;
    _.total_posts = res.total_posts;
    
    if( res.have_more_posts ) {
        // have more posts
        _.load_more_button_init();
    }
    else {
        // no more posts, hide button
        _.load_more_button_hide();
    }
}

FF_Ajax.prototype.load_more_button_hide = function(){
    if( !this.load_more_button ) return;
    this.load_more_button.style.display = 'none';
}

FF_Ajax.prototype.load_more_button_init = function(){
    var _ = this;
    
    if( _.load_more_button ) {
        // show existing button
        _.load_more_button.style.display = '';
        return;
    }

    // create new button
    _.load_more_button = document.createElement('div');
    _.load_more_button.classList.add('load-more-btn', 'btn');

    var load_more_text = 'Load more';
    if( typeof _.options.load_more_text !== 'undefined' ) {
        load_more_text = _.options.load_more_text;
    }
    _.load_more_button.textContent = load_more_text;

    _.loop.after(_.load_more_button);

    _.load_more_button.addEventListener('click', function(){
        _.load_more();
    });
}

FF_Ajax.prototype.load_more = function(){
    var _ = this;
    if( _.container.classList.contains('load_more_loading') ) return;

    _.type = 'load_more';
    _.query_args.offset = _.total_posts;

    _.container.classList.add('load_more_loading');
    _.query(function(){
        _.container.classList.remove('load_more_loading');
    });
}

FF_Ajax.prototype.filters_init = function(){
    var _ = this;
    _.filters = new FF_Filters();
    // _.filters = {};
    
    var fields = _.container.querySelectorAll('.ff_ajax_filter');
    if( !fields ) return;

    fields.forEach(function(field){

        _.filter_item_init(field);

        // input text, select
        field.addEventListener('change', function(){
            var value = field.value;
            if( field.type == 'checkbox' && !field.checked ) {
                value = '';
            }
            _.add_filter_indicator(field);
            var filter_value = _.filter_item_update(field, value);
            console.log('on change', filter_value);
            _.filter_update_query(field, filter_value);
        });
    })

    _.clear_filters_init();
}

FF_Ajax.prototype.filter_item_init = function(field){
    var _ = this;
    var key = _.get_field_key(field);

    if( _.filters.item_exists(key) ) return;
    
    var multiple = field.dataset.multiple;

    var filter_options = {
        key,
        query_type: field.dataset.query_type,
        element: field,
        value: multiple ? [] : '',
    }

    _.filters.item_init(key, filter_options);
}

FF_Ajax.prototype.filter_item_update = function(field, value){
    var _ = this;
    var key = _.get_field_key(field);
    _.filters.update(key, value);
    return _.filters.get_value(key);
}

FF_Ajax.prototype.filter_buttons_init = function(){
    var _ = this;
    var fields = _.container.querySelectorAll('.ff_ajax_filter_buttons');
    if( !fields ) return;
    fields.forEach(function(field){

        _.filter_item_init(field);

        field.current = null;
        field.buttons = field.querySelectorAll('button');
        field.buttons.forEach(function(button){
            button.addEventListener('click', function(){
                button.classList.toggle('selected');
                _.filter_buttons_change(button, field);
            });
        })
    });
}
FF_Ajax.prototype.filter_buttons_change = function(button, field){
    var _ = this;
    
    var is_selected = button.classList.contains('selected');

    var value = button.dataset.value;
    var key = _.get_field_key(field);
    
    if( field.dataset.multiple ) {
        // multiple
        if( is_selected ) {
            _.filters.add(key, value);
        }
        else {
            _.filters.remove(key, value);
        }
    }
    else {
        // single
        if( field.current && field.current != button ) {
            field.current.classList.remove('selected');
        }
        field.current = is_selected ? button : null;
        
        if( !is_selected ) {
            value = '';
        }
        _.filters.set(key, value);
    }
    
    var filter_value = _.filters.get_value(key);
    _.filter_update_query(field, filter_value);
}

FF_Ajax.prototype.filter_checkboxes_init = function(){
    var _ = this;
    var fields = _.container.querySelectorAll('.ff_ajax_filter_checkboxes');
    if( !fields ) return;
    fields.forEach(function(field){

        _.filter_item_init(field);

        field.current = null;
        field.checkboxes = field.querySelectorAll('input[type="checkbox"]');
        field.checkboxes.forEach(function(checkbox){
            checkbox.addEventListener('change', function(){
                _.filter_checkboxes_change(checkbox, field);
            });
        })
    });
}
FF_Ajax.prototype.filter_checkboxes_change = function(checkbox, field){
    var _ = this;
    
    var is_selected = checkbox.checked;

    var value = checkbox.value;
    var key = _.get_field_key(field);
    
    if( field.dataset.multiple ) {
        // multiple
        if( is_selected ) {
            _.filters.add(key, value);
        }
        else {
            _.filters.remove(key, value);
        }
    }
    else {
        // single
        if( field.current && field.current != checkbox ) {
            field.current.checked = false;
        }
        field.current = is_selected ? checkbox : null;
        if( !is_selected ) {
            value = '';
        }
        _.filters.set(key, value);
    }
    
    var filter_value = _.filters.get_value(key);

    _.filter_update_query(field, filter_value);
}

FF_Ajax.prototype.filter_field_update = function(field, value = null){
    var _ = this;

    if( value === null ) {
        value = field.value;
    }

    var args;

    if( field.dataset.query_type == 'tax_query' ) {
        // tax_query
        args = {
            taxonomy: field.dataset.taxonomy,
            terms: value,
            field: field.dataset.taxonomy_field ?? 'slug',
            filter_key: field.dataset.filter_key ?? field.dataset.taxonomy,
        }
    }
    else {
        // meta_query
        args = {
            key: field.dataset.meta_key,
            value: value,
            type: field.dataset.meta_type ?? 'CHAR',
            compare: field.dataset.compare ?? '=',
            filter_key: field.dataset.filter_key ?? field.dataset.meta_key
        }
    }
    
    _.update_query_args(args);

    // console.log('filter_field_update', {value, filters:_.filters, query_args:_.query_args});
}

FF_Ajax.prototype.custom_filter_update = function(args){
    var _ = this;

    var type = args.taxonomy ? 'tax_query' : 'meta_query';

    var key = args.filter_key;
    if( !key ) {
        key = args.taxonomy ?? args.key;
    }

    var value = args.terms ?? args.value;

    _.filters.items[key] = {
        key: key,
        value: value,
        el: null,
        query_type: type,
    };

    _.update_query_args(args);
}

FF_Ajax.prototype.filter_update_query = function(field, value){
    var _ = this;
    _.filter_field_update(field, value);
    if( _.query_on_change ) {
        _.filter_query();
    }
}

FF_Ajax.prototype.update_query_args = function(args){

    var _ = this;
    
    var type = typeof args.taxonomy !== 'undefined' ? 'tax_query' : 'meta_query';

    if( typeof _.query_args[type] === 'undefined' ) {
        // initial, insert immediately and exit
        _.query_args[type] = [];
        _.query_args[type].push(args);
        return;
    }

    var query_type = _.query_args[type];

    var search_key = 'filter_key';
    var search_value = args.filter_key;
    if( !args.filter_key ) {
        search_key = type == 'tax_query' ? 'taxonomy' : 'key';
        search_value = type == 'tax_query' ? args.taxonomy : args.key;
    }
    
    var filter_index = _.get_index_key_value(search_key, search_value, _.query_args[type]);

    var value_key = type == 'tax_query' ? 'terms' : 'value';

    var query_value = args[value_key];
    
    if( filter_index === false ) {
        // filter not found
        // add new
        if( !query_value ) return;
        query_type.push(args);
    }
    else {
        // filter found
        if( !query_value || !query_value.length) {
            // remove
            query_type.splice(filter_index, 1);
        } else {
            // update existing
            query_type[filter_index][value_key] = query_value;
        }  
    }
}

FF_Ajax.prototype.filter_query = function(){
    var _ = this;
    _.type = 'filter';
    _.total_posts = 0;
    _.query_args.offset = 0;
    
    _.container.classList.add('filter_loading');
    _.query(function(){
        _.container.classList.remove('filter_loading');
    });
}

FF_Ajax.prototype.filters_update = function(){
    var _ = this;
    // set filters from the initlal field values

    // disable query on change temporarily
    var previous_setting = _.query_on_change;
    _.query_on_change = false;

    _.fields_update();

    if( _.have_filters() ){
        _.filter_query();
    }

    // restore
    _.query_on_change = previous_setting;
}

FF_Ajax.prototype.fields_update = function(){
    var _ = this;
    var keys = Object.keys(_.filters.items);
    for(var i = 0; i < keys.length; i++) {
        var item = _.filters.items[keys[i]];
        if( !item.element ) continue;
        var element = item.element;

        if( typeof element.checked !== 'undefined' ) {
            // checkbox
            if( element.checked ) {
                element.dispatchEvent(new Event('change'));
            }
        }
        else if( typeof element.buttons !== 'undefined' ) {
            // buttons
            element.buttons.forEach(function(button){
                if( button.classList.contains('selected') ) {
                    _.filter_buttons_change(button, element);
                }
            })
        }
        else {
            // text, select
            if( element.value ) {
                element.dispatchEvent(new Event('change'));
            };
        }
    }
}

FF_Ajax.prototype.add_filter_indicator = function(field){
    var _ = this;
    // only support select fields with multiple
    if( field.nodeName !== 'SELECT' ) return;
    if( !field.dataset.multiple ) return;
    if( !field.value ) return;
    
    _.filter_indicators_init();

    var filter = _.filters.get_item_by_field(field);
    
    if( typeof filter.indicators === 'undefined' ) {
        filter.indicators = [];
    }
    
    var value = filter.element.selectedOptions[0].value;

    if( filter.value.indexOf(value) !== -1 ) {
        // already added
        filter.element.value = '';
        return;
    }

    var indicator = document.createElement('span');
    indicator.classList.add('indicator');
    var text = filter.element.selectedOptions[0].text;
    if( filter.element.dataset.indicator_prefix ) {
        text = filter.element.dataset.indicator_prefix + text;
    }
    indicator.textContent = text;

    var remove_button = document.createElement('span');
    remove_button.classList.add('remove');
    indicator.append(remove_button);

    _.filter_indicators_container.append(indicator);
    filter.indicators.push(indicator);

    remove_button.addEventListener('click', function(){
        _.indicator_remove(filter, indicator, value);
    })

    // reset field after select
    // chosen option is displayed with indicator
    filter.element.value = ''; 
}

FF_Ajax.prototype.filter_indicators_init = function(){
    var _ = this;
    if( typeof _.filter_indicators_container !== 'undefined' ) return;

    var container = _.container.querySelector('.filter_indicators');
    if( !container ) {
        // create new container
        container = document.createElement('div');
        container.classList.add('filter_indicators')
        _.loop.before(container);
    }

    _.indicator_remove_delay = 800;
    _.indicator_remove_timeout = null;
    _.filter_indicators_container = container;
}

FF_Ajax.prototype.indicator_remove = function(filter, indicator, value){
    var _ = this;
    var indicator_index_to_remove = filter.indicators.indexOf(indicator);
    filter.indicators.splice(indicator_index_to_remove, 1);
    indicator.remove();

    var value_index_to_remove = filter.value.indexOf(value);
    filter.value.splice(value_index_to_remove, 1);

    _.filter_field_update(filter.element, '');
    
    clearTimeout(_.indicator_remove_timeout);
    _.indicator_remove_timeout = setTimeout(function(){
        if( _.query_on_change ) {
            _.filter_query();
        }
    }, _.indicator_remove_delay);
}

FF_Ajax.prototype.clear_filters_init = function(){
    var _ = this;
    _.clear_filters_button = _.container.querySelector('.clear_filters');
    if( !_.clear_filters_button ) return;
    _.clear_filters_button.addEventListener('click', function(){
        _.clear_filters_button.style.display = 'none';
        _.clear_filters();
        _.filter_query();
        if( typeof _.on_clear_filters === 'function' ) {
            _.on_clear_filters();
        }
    });
}

FF_Ajax.prototype.clear_filters = function(){
    var _ = this;
    var filter_keys = Object.keys(_.filters.items);

    for( var i = 0; i < filter_keys.length; i++ ) {
        var filter_key = filter_keys[i];
        var filter = _.filters.items[filter_key];
        var element = filter.element;
        
        if( element ) {

            // reset input fields
            if( element.value ) {
                element.value = '';
            }
            
            // remove clear field buttons
            _.field_clear_remove(element);

            // reset buttons
            if( element.buttons ) {
                element.buttons.forEach(button=>{
                    button.classList.remove('selected');
                })
            }

            // reset checkboxes
            if( element.checkboxes ) {
                element.checkboxes.forEach(checkbox=>{
                    checkbox.checked = false;
                })
            }

            // checkbox
            if( element.checked ) {
                element.checked = false;
            }

        }

        // remove indicators
        if( typeof filter.indicators !== 'undefined' ) {
            filter.indicators.forEach(function(indicator){
                indicator.remove();
            })
            filter.indicators = [];
        }
        
        // update query_args
        var filter_index = _.get_index_key_value('filter_key', filter.key, _.query_args[filter.query_type]);
        if( filter_index !== false ) {
            _.query_args[filter.query_type].splice(filter_index, 1);
        }

        // reset filter values
        filter.value = typeof filter.value === 'object' ? [] : '';
    }
    

    // reset search
    if( typeof _.search !== 'undefined' ) {
        _.search.clear();
    } 

}

FF_Ajax.prototype.have_filters = function(){
    var _ = this;
    var keys = Object.keys(_.filters.items);
    for( var i = 0; i < keys.length; i++ ) {
        var key = keys[i];
        var filter = _.filters.items[key];
        if( typeof filter.value == 'object' ) {
            // array
            if( filter.value.length ) return true;
        }
        else {
            // string
            if( filter.value ) return true;
        }
    }
    return false;
}

FF_Ajax.prototype.jquery_datepicker_support = function(field){
    var _ = this;
    jQuery(field).datepicker('option', 'onSelect', function(dateText, instance){    
        // date query format = Ymd
        var value = instance.selectedYear +''+ _.two_digit_format(instance.selectedMonth+1) +''+ _.two_digit_format(instance.selectedDay);
        _.filter_update_query(field, value);
    })
}

FF_Ajax.prototype.filter_datepicker = function(field, dp){
    var _ = this;
    var value = dp.selectedYear +''+ _.two_digit_format(dp.selectedMonth+1) +''+ _.two_digit_format(dp.selectedDay);
    _.field_clear_init(field);
    _.filter_update_query(field, value);
}

FF_Ajax.prototype.field_clear_init = function(field){
    if( field.clear_button ) return;
    var _ = this;
    
    var button = document.createElement('div');
    button.classList.add('field_clear');
    field.after(button);
    field.clear_button = button;
    
    button.addEventListener('click', function(){
        field.value = '';
        _.filter_update_query(field, '');
        _.field_clear_remove(field);
    });
}

FF_Ajax.prototype.search_init = function(){
    var _ = this;
    if( typeof _.search !== 'undefined' ) return;
    var field = _.container.querySelector('.search_field');
    if( !field ) return;
    _.search = new FF_Search({
        el: field,
        query_args: _.query_args,
        with_clear: field.dataset.with_clear,
    });
    _.search.after_submit = function(){
        _.filter_query();
    }
}

FF_Ajax.prototype.sort_init = function(){
    var _ = this;
    var dropdown = _.container.querySelector('.ff_ajax_sort');
    if( !dropdown ) return;

    var sort_selected = null;
    dropdown.addEventListener('change', function(){
        var selected_option = dropdown.selectedOptions[0];
        if( sort_selected == selected_option ) return; // no change
        sort_selected = selected_option;
        _.sort_update_query_args(selected_option);
    });
}

FF_Ajax.prototype.sort_update_query_args = function(option){
    var _ = this;
    
    if( !option.value ) {
        delete _.query_args.orderby;
        delete _.query_args.order;
    }
    else {
        var sort_args = [
            'meta_key',
            'orderby',
            'order',
        ];
        for( var i = 0; i < sort_args.length; i++ ) {
            var sort_arg = option.dataset[sort_args[i]];
            if( typeof sort_arg !== 'undefined' && sort_arg ) {
                _.query_args[sort_args[i]] = sort_arg;
            } 
        }
    }
    
    _.filter_query();
}

FF_Ajax.prototype.get_field_key = function(field){
    key = field.dataset.filter_key;
    if( !key ) {
        key = field.dataset.meta_key ?? field.dataset.taxonomy;
    }
    return key;
}

FF_Ajax.prototype.field_clear_remove = function(field){
    if( !field.clear_button ) return;
    field.clear_button.remove();
    field.clear_button = null;
}

FF_Ajax.prototype.two_digit_format = function(num){
    if( num < 10 ) {
        num = '0'+num;
    }
    return num;
}

FF_Ajax.prototype.get_index_key_value = function(key, value, arr){
    if( !arr ) return false;
    for( var i = 0; i < arr.length; i++ ) {
        if( typeof arr[i][key] == 'undefined' ) continue;
        if( arr[i][key] == value ) {
            return i;
        }
    }
    return false;
}


function FF_Filters(){
    this.items = {};
}
FF_Filters.prototype.item_init = function(key, args){
    this.items[key] = args;
}
FF_Filters.prototype.set = function(key, value){
    this.items[key].value = value;
}
FF_Filters.prototype.add = function(key, value){
    var item = this.items[key];
    if( item.value.indexOf(value) !== -1 ) return; 
    item.value.push(value);
}
FF_Filters.prototype.remove = function(key, value){
    var item = this.items[key];
    var index_to_remove = item.value.indexOf(value);
    if( index_to_remove === -1 ) return; 
    item.value.splice(index_to_remove, 1);
}
FF_Filters.prototype.update = function(key, value){
    if( typeof this.items[key].value === 'object' ) {
        this.add(key, value);
    }
    else {
        this.set(key, value);
    }
}
FF_Filters.prototype.get = function(key){
    return this.items[key];
}
FF_Filters.prototype.get_value = function(key){
    return this.items[key].value;
}
FF_Filters.prototype.item_exists = function(key){
    return typeof this.items[key] !== 'undefined';
}
FF_Filters.prototype.clear_values = function(){
    var keys = Object.keys(this.items);
    for(var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var filter = this.items[key];
        filter.value = typeof filter.value === 'object' ? [] : '';
    }
}
FF_Filters.prototype.get_item_by_field = function(field){
    var key = field.dataset.filter_key;
    if( !key ) {
        key = field.dataset.meta_key ?? field.dataset.taxonomy;
    }
    return this.items[key];
}
FF_Filters.prototype.get_items = function(){
    var items = [];
    var keys = Object.keys(this.items);
    for(var i = 0; i < keys.length; i++) {
        items.push(this.items[keys[i]]);
    }
    return items;
}

function FF_Search(options){
    this.options = options;
    this.el = options.el;
    this.query_args = options.query_args,
    this.timeout = null;
    this.timeout_duration = options.timeout_duration ?? 1000;
    this.last_value = null;
    this.clear_button = null;
    this.init();
}
FF_Search.prototype.init = function(){
    var _ = this;
    _.el.addEventListener('keyup', function(e){
        clearTimeout(_.timeout);
        if( e.code.indexOf('Enter') !== -1 ) {
            _.submit(e.target.value);
            return;
        }
        _.timeout = setTimeout(function(){
            _.submit(e.target.value);
        }, _.timeout_duration);
    });
}
FF_Search.prototype.submit = function(value){
    var _ = this;
    if( _.last_value == value ) return;
    _.last_value = value;
    _.value = value;

    _.update_query_args();
    _.clear_init();

    if( typeof _.after_submit === 'function' ) {
        _.after_submit();
    }
}
FF_Search.prototype.update_query_args = function(){
    if( this.value ) {
        this.query_args.s = this.value;
    }
    else {
        delete this.query_args.s;
    }
}
FF_Search.prototype.clear_init = function(){
    if( !this.options.with_clear ) return;
    if( this.value && !this.clear_button ) {
        this.clear_button_add();
    }
    else if( !this.value && this.clear_button ){
        this.clear_button_remove();
    }
}
FF_Search.prototype.clear_button_add = function(){
    var _ = this;
    _.clear_button = document.createElement('div');
    _.clear_button.classList.add('field_clear');
    _.el.after(_.clear_button);

    _.clear_button.addEventListener('click', function(){
        _.clear();
        if( typeof _.after_submit === 'function' ) {
            _.after_submit();
        }
    });
}
FF_Search.prototype.clear_button_remove = function(){
    if( !this.clear_button ) return;
    this.clear_button.remove();
    this.clear_button = null;
}
FF_Search.prototype.clear = function(){
    this.clear_button_remove();
    this.el.value = '';
    this.value = '';
    this.update_query_args();
}