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

export function get_el(element, multiple = false, parent = document) {
	if ( typeof element === 'string' ) {
		if (multiple) {
			return parent.querySelectorAll(element);
		} else {
			return parent.querySelector(element);
		}
	}
	return element;
}

export function create_div(class_name, append_to = null, text = null){

    const div = document.createElement('div');
    div.className = class_name;

    if( append_to ) {
        if( typeof append_to === 'string' ) {
            append_to = document.querySelector(append_to);
        }
        append_to.append(div);
    }

    if( text ) div.textContent = text;

    return div;
}