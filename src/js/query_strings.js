export default class Query_Strings {

    constructor(args){
        this.main = args.main;
        this.load_query_strings();
    }
    
    update(){
        const filter_params = this.get_filter_params();
        const url = new URL(window.location.href);
        url.searchParams.set('ff_ajax_filters', JSON.stringify(filter_params));
        history.pushState({}, null, url.href);
    }
    
    get_filter_params(){
        const args = this.main.get_filter_query_args();
        
        let params = {};

        const meta = this.get_args_meta(args);
        if( meta ) params.meta = meta;
        
        const tax = this.get_args_tax(args);
        if( tax ) params.tax = tax;        

        // console.log('get_filter_params', {args, params})

        return params;
    }

    get_args_meta(args){
        if( !args.meta_query || !args.meta_query.length ) return null;

        const meta = [];

        args.meta_query.forEach(row=>{
            const _row = {
                key: row.key,
                value: row.value,
            }
            if( row.compare ) _row.compare = row.compare;
            meta.push(_row);
        })

        return meta;
    }

    get_args_tax(args){
        if( !args.tax_query || !args.tax_query.length ) return null;

        const tax = {};

        args.tax_query.forEach(row=>{
            
            if( typeof tax[row.taxonomy] === 'undefined' ) tax[row.taxonomy] = [];
            
            if( typeof row.terms === 'string' && row.terms ) {
                add_unique(tax[row.taxonomy], row.terms);
            }

            if( Array.isArray(row.terms) ) {
                row.terms.forEach(term=>{
                    add_unique(tax[row.taxonomy], term);
                });
            }
        })

        return tax;
    }
    
    load_query_strings(){
        let filters = new URL(window.location.href).searchParams.get('ff_ajax_filters');
        if( !filters ) return;
        filters = JSON.parse(filters);
        console.log('load_query_strings', filters);
    }
}

function add_unique(arr, item){
    if( arr.indexOf(item) !== -1 ) return;
    arr.push(item);
}