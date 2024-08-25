const fs = require('node:fs');

// generate custom manifest file with only entry points
generate_custom_manifest('dist/wp-manifest.json', 'dist/.vite/manifest.json');

function generate_custom_manifest(output, input){
    let manifest_data = {
        entry_points: get_manifest_entry_points(input),
        mode: process.argv[2],
    }
    fs.writeFile(output, JSON.stringify(manifest_data), ()=>{});
}

function get_manifest_entry_points(file_path){
    let data = fs.readFileSync(file_path, 'utf8');
    let manifest_data = JSON.parse(data);
    let entry_points = {};
    for (const [key, value] of Object.entries(manifest_data)) {
        if( typeof value.isEntry === 'undefined' || !value.isEntry ) continue;
        entry_points[value.src] = {
            file: value.file,
            css: value.css,
        }
    }
    return entry_points;
}
