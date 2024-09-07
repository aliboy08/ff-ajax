export function get_index_key_value(key, value, arr) {
	if (!arr) return false;
	for (let i = 0; i < arr.length; i++) {
		if (typeof arr[i][key] == 'undefined') continue;
		if (arr[i][key] == value) {
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

export function apply_query_string(key, value) {

	const url = new URL(window.location.href);

    if( typeof value === 'object' ) {

        if ( !value.length ) {
            url.searchParams.delete(key);
        } else {
            url.searchParams.set(key, value.join(','));
        }

    } else {
        if (!value) {
            url.searchParams.delete(key);
        } else {
            url.searchParams.set(key, value);
        }
    }
    
	window.history.replaceState(null, document.title, url.href);
}
