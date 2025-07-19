/* document.addEventListener('DOMContentLoaded', initLayout); */
let vertText;
let presentationContent;

export function initLayout(){
    vertText = document.getElementById("verticalText");
    presentationContent = document.getElementById("presentationContent");

    window.addEventListener("resize", ajustVertText);
    window.addEventListener("orientationchange", ajustVertText);
    ajustVertText();
    setTimeout(ajustVertText, 150);

        
}

function ajustVertText(){
  // afficherTaille();

    let rect1 = vertText.getBoundingClientRect();
    let rect2 = presentationContent.getBoundingClientRect();

    let actualSize = parseFloat(window.getComputedStyle(vertText).fontSize);
    let step = 0.2; 

    let shouldShrink = rect1.height > rect2.height;
    let comparator = shouldShrink
    ? () => vertText.getBoundingClientRect().height > rect2.height
    : () => vertText.getBoundingClientRect().height < rect2.height;
    
    while (comparator()) {
        actualSize += shouldShrink ? -step : step;
        vertText.style.fontSize = actualSize + 'px';
    }

    let finalRect = vertText.getBoundingClientRect();
    let rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    vertText.parentElement.style.width = (finalRect.width + rem) + 'px';

    let parentWidth = vertText.parentElement.getBoundingClientRect().width;
    let viewportWidth = window.visualViewport?.width || window.innerWidth;

    if (parentWidth > viewportWidth / 4) {
        console.log("Le texte prend plus d'un quart de la page");

        vertText.parentElement.style.width = (4 * rem) + 'px';
        vertText.style.fontSize = "4rem";
    }
}

function afficherTaille() {
      const largeur = window.innerWidth;
      const hauteur = window.innerHeight;
      document.getElementById("taille").textContent = 
        `Largeur: ${largeur}px, Hauteur: ${hauteur}px`;
}

