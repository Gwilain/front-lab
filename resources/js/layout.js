/* document.addEventListener('DOMContentLoaded', initLayout); */
let vertText;
let presentationContent;

export function initLayout(){
    vertText = document.getElementById("verticalText");
    presentationContent = document.getElementById("presentationContent");

    window.addEventListener("resize", ajustVertText);
    window.addEventListener("orientationchange", ajustVertText);
    ajustVertText();
    setTimeout(ajustVertText, 10);
}

function ajustVertText(){
   
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
}