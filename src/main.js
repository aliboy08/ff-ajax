import './main.scss';
import FF_Ajax from './js/ff_ajax';

document.addEventListener('DOMContentLoaded',()=>{

    document.querySelectorAll('.ff_ajax').forEach(container=>{
        const settings = JSON.parse(container.dataset.settings);
        settings.container = container;
        container.ff_ajax = new FF_Ajax(settings);
    })
 
});