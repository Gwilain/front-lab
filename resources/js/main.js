import { initColorTheme } from './colorTheme.js';
import { initLayout } from './layout.js';

document.addEventListener('DOMContentLoaded', init);

function init(){
    
    initColorTheme();
    initLayout();
}


let ancienMetier = "DA";
let nouveauMetier = "Développeur Web";

function reconversionPro() {
  if (envieDeChanger && aimeCoder) {
    startReconversion(ancienMetier, nouveauMetier);
    console.log("Nouvelle vie en cours de compilation...");
  }
}