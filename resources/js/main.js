import { initColorTheme } from './resources/js/colorTheme.js';
import { initLayout } from './resources/js/layout.js';

document.addEventListener('DOMContentLoaded', init);

function init(){
    
    initColorTheme();
    initLayout();
}