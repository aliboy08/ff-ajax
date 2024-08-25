export function get_index_key_value(key, value, arr){
    if( !arr ) return false;
    for( let i = 0; i < arr.length; i++ ) {
        if( typeof arr[i][key] == 'undefined' ) continue;
        if( arr[i][key] == value ) {
            return i;
        }
    }
    return false;
}

export function create_dom(html) {
	const temp_element = document.createElement('div');
	temp_element.innerHTML = html;
	return temp_element.children[0];
}