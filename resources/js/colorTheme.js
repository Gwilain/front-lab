/* document.addEventListener('DOMContentLoaded', initColorTheme); */

let colorIterator = 0;
let assocColor = [];

let intervalId = null;
let isPaused = false;
let pausedTime = 0;
let totalTime = 0;
let startTime = 0;
let durationRef = 0;
let radiusRef = 0;

let colorBullets;

export function initColorTheme(){

  goColorTheme(true);

  document.getElementById('countDown').addEventListener('click', onClickCountDown);

  document.getElementById("colorPlayer").addEventListener("click", onArrowColorClick);
  

  colorBullets = document.getElementById('thmeesBtns')
  colorBullets.addEventListener('click', onClickColorBullets);

}

function onClickColorBullets(e){
  if (e.target.tagName.toLowerCase() === 'button') {
    const buttons = Array.from(colorBullets.querySelectorAll('button'));
    colorIterator = buttons.indexOf(e.target);
    goColorTheme(false);
  }
}

function goColorTheme(newTheme){
  if(newTheme){
    let colors = generateColors();
    assocColor.push(colors);
    if(colorIterator == 0){
      document.getElementById("back").classList.remove("inactive");
    }
  }
  applyColors();
  refreshColorList();
  startCountdown(20, 10);
}



function applyColors(){
  document.documentElement.style.setProperty('--color-bg', assocColor[colorIterator][0]);
  document.documentElement.style.setProperty('--color-text', assocColor[colorIterator][1]);
}

function onArrowColorClick(e) {
  let target = e.target;

  if (target.tagName === "polygon" || target.tagName === "POLYGON") {
    target = target.parentNode;
  }

  let newTheme = false;

  if (target.id === "forward" ){

    colorIterator++;
    if(colorIterator == assocColor.length){
      newTheme = true;
    }

    document.getElementById("back").classList.remove("inactive");

  }else{
    colorIterator--;
    if(colorIterator <= 0){
      document.getElementById("back").classList.add("inactive");
      colorIterator = 0;
    }
  } 

  goColorTheme(newTheme);
}



function refreshColorList(){

  let ul = document.getElementById("thmeesBtns");
  let content = "";
  for (let i = 0; i < assocColor.length; i++) {
    let char = "&#9675;";
    if(i === colorIterator){
      char = "&#9679;";
    }
    content += "<li><button>"+char+"</button></li>";
  }
  ul.innerHTML = content;
}



function randomHexColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

function luminance(hex) {
  const rgb = hex.replace('#', '').match(/.{2}/g).map(c => parseInt(c, 16) / 255);
  const a = rgb.map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function contrastRatio(hex1, hex2) {
  const lum1 = luminance(hex1);
  const lum2 = luminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function getContrastScore(ratio) {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA Large';
  return 'Fail';
}


function generateColors() {
  let hex1 = randomHexColor();
  let hex2 = randomHexColor();
  let ratio = contrastRatio(hex1, hex2);

  while (ratio < 4.5) {
    hex2 = randomHexColor();
    ratio = contrastRatio(hex1, hex2);
  }

  const score = getContrastScore(ratio);

  document.getElementById("colors").innerHTML = `<span class="colorTxt">${hex1}</span>  -  <span class="colorTxt">${hex2}</span> -- Ratio de contraste - ${ratio.toFixed(2)} - <span class="colorTxt">${score}</span>`;

  return [hex1, hex2];

}



function startCountdown(duration, radius) {
  if (intervalId !== null) {
    clearInterval(intervalId);
  }

  durationRef = duration;
  radiusRef = radius;
  totalTime = duration * 1000;
  const intervalTime = 1000 / 30;
  const progressCircleMask = document.getElementById('circleMask');
  const cd1 = document.getElementById('cd1');
  const cd2 = document.getElementById('cd2');
  const circumference = 2 * Math.PI * radius;

  progressCircleMask.setAttribute('r', radius);
  progressCircleMask.setAttribute('stroke-dasharray', circumference);
  progressCircleMask.setAttribute('stroke-dashoffset', 0);

  startTime = Date.now() - pausedTime;

  intervalId = setInterval(() => {
    if (isPaused) return;

    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;
    const remainingTime = Math.max(totalTime - elapsedTime, 0);

    const secondsLeft = Math.ceil(remainingTime / 1000);
    cd1.textContent = secondsLeft;
    cd2.textContent = secondsLeft;

    const progress = (elapsedTime / totalTime) * circumference;
    progressCircleMask.style.strokeDashoffset = Math.min(progress, circumference);

    // If finished
    if (elapsedTime >= totalTime) {
      clearInterval(intervalId);
      intervalId = null;
      cd1.textContent = "0";
      cd2.textContent = "0";
      pausedTime = 0;
      isPaused = false;

      colorIterator++;

      let newTheme  = colorIterator >= assocColor.length;

      goColorTheme(newTheme);
    }
  }, intervalTime);
}

function onClickCountDown(){
  let countDown = document.getElementById("countDown");

  if (intervalId === null) {
    isPaused = false;
    startCountdown(durationRef, radiusRef);
    

  } else {
    isPaused = !isPaused;
    if (isPaused) {
      countDown.classList.add("fadeLoop");
      pausedTime = Date.now() - startTime;
    } else {
      countDown.classList.remove("fadeLoop");
      startTime = Date.now() - pausedTime;
    }
  }
}


