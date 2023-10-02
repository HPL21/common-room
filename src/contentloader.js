import { dict } from './lang.js';

import cardPNG from './assets/images/card.png';
import clearPNG from './assets/images/clear.png';
import chooseColorPNG from './assets/images/choose_color.png';
import eraserPNG from './assets/images/eraser.png';
import savePNG from './assets/images/save.png';
import undoPNG from './assets/images/undo.png';

export function loadMenu() {
    let lang = localStorage.getItem('lang') || 'en';
    let dictLang = dict[lang];
    let content = document.getElementById('content');
    content.innerHTML = `<div class="card-container"><button id="card1" type="button" class="card"><img src="./assets/images/card.png"><div class="card-text">${dictLang.canvas}</div></button>
                          <button id="card2" type="button" class="card"><img src="./assets/images/card.png"></button>
                          <button id="card3" type="button" class="card"><img src="./assets/images/card.png"></button></div>`;
}

export function loadCanvas() {
    let content = document.getElementById('content');
    let lang = localStorage.getItem('lang') || 'en';
    let dictLang = dict[lang];
    content.innerHTML = `<div id="canvasContainer" class="canvas-container"></div>
    <div id="toolbox" class="toolbox">
        <button id="btnClear" type="button" class="toolbox-button"><img src="./assets/images/clear.png" alt="${dictLang.clear}" title="${dictLang.clear}"></button>
        <div id="colorPicker" class="color-picker" title="${dictLang.color}">
            <input id="btnColor" type="color" class="color-picker-input" value="#ffffff">
            <button class="color-picker-button"><img src="assets/images/choose_color.png"></button>
        </div>
        <div id="sizePicker" class="size-picker">
            ${dictLang.size}<input id="btnSize" type="range" min="1" max="50" value="5" class="">
        </div>
        <button id="btnEraser" type="button" class="toolbox-button"><img src="./assets/images/eraser.png" alt="${dictLang.eraser}" title="${dictLang.eraser}"></button>
        <button id="btnUndo" type="button" class="toolbox-button"><img src="./assets/images/undo.png" alt="${dictLang.undo}" title="${dictLang.undo}"></button>
        <button id="btnSave" type="button" class="toolbox-button"><img src="./assets/images/save.png" alt="${dictLang.save}" title="${dictLang.save}"></button>
    </div>`;


}