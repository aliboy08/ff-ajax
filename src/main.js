import './main.scss';
import FF_Ajax from './js/ff_ajax';

document.addEventListener('DOMContentLoaded',()=>{
    
    document.querySelectorAll('.ff_ajax').forEach(container=>{
        const settings = JSON.parse(container.dataset.settings);
        settings.container = container;
        container.ff_ajax = new FF_Ajax(settings);

        const e = new Event('ff_ajax_init');
        e.ff_ajax = container.ff_ajax;
        document.dispatchEvent(e);
    });
    
});