import { initColorTheme } from './colorTheme.js';
import { initLayout } from './layout.js';

document.addEventListener('DOMContentLoaded', init);

function init(){
    
    initColorTheme();
    initLayout();
}