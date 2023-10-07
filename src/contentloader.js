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

export function loadRoomCreator() {
    let content = document.getElementById('content');
    let lang = localStorage.getItem('lang') || 'en';
    let dictLang = dict[lang];
    content.innerHTML = `<div id="roomCreator" class="room-creator">
                            <div id="roomCreatorHeader" class="room-creator-header">
                                <div class="header2">${dictLang.createroom}</div>
                            </div>
                            <div id="roomCreatorContent" class="room-creator-content">
                                <div id="roomNameInput" class="room-input room-creator-item">
                                    <label>${dictLang.roomname}</label>
                                    <input id="txtRoomName" type="text" class="input-text">
                                </div>
                                <div id="roomPasswordInput" class="room-input room-creator-item">
                                    <label>${dictLang.password}</label>
                                    <input id="txtRoomPassword" type="password" class="input-text">
                                </div>
                                <div id="roomDescriptionInput" class="room-input room-creator-item">
                                    <label>${dictLang.desc}</label>
                                    <textarea id="txtRoomDescription" rows="3" class="input-text description-input"></textarea>
                                </div>
                                <div id="roomAddUsers" class="room-add-users room-creator-item">
                                    <div id="addedUsers"></div>
                                    <div id="addUserInput" >
                                        <label>${dictLang.adduser}</label>
                                        <div class="add-user-input">
                                            <input id="txtAddUser" type="text" class="input-text">
                                            <button id="btnAddUser" type="button" class="white-button plus-button">+</button>
                                        </div>
                                    </div>
                                    <div id="addUserError" class="add-user-error">
                                        <div id="lblAddUserErrorMessage" class="error-message">Error message</div>
                                    </div>
                                    <button id="btnAddUser" type="button" class="white-button">${dictLang.add}</button>
                                </div>
                                <div id="roomCreatorError" class="room-creator-error room-creator-item">
                                    <div id="lblRoomCreatorErrorMessage" class="error-message">Error message</div>
                                </div>
                                <div id="roomCreatorButtons" class="room-creator-buttons room-creator-item">
                                    <button id="btnCreateRoom" type="button" class="white-button">${dictLang.create}</button>
                                    <button id="btnCancelRoom" type="button" class="white-button">${dictLang.cancel}</button>
                                </div>
                            </div>
                        </div>`;
}

export function loadRoomJoin() {
    let content = document.getElementById('content');
    let lang = localStorage.getItem('lang') || 'en';
    let dictLang = dict[lang];
    content.innerHTML = `<div id="roomJoin" class="room-creator">
                            <div id="roomJoinHeader" class="room-creator-header">
                                <div class="header2">Stwórz pokój</div>
                            </div>
                            <div id="roomJoinContent" class="room-creator-content">
                                <div id="roomNameInput" class="room-input room-creator-item">
                                    <label>Nazwa pokoju</label>
                                    <input id="txtRoomName" type="text" class="input-text">
                                </div>
                                <div id="roomPasswordInput" class="room-input room-creator-item">
                                    <label>Hasło</label>
                                    <input id="txtRoomPassword" type="password" class="input-text">
                                </div>
                                <div id="roomJoinButtons" class="room-creator-buttons room-creator-item">
                                    <button id="btnJoinRoom" type="button" class="white-button">Dołącz</button>
                                    <button id="btnCancelJoinRoom" type="button" class="white-button">Anuluj</button>
                                </div>
                            </div>
                        </div>`;
}

export function loadLobby() {
    let content = document.getElementById('content');
    let lang = localStorage.getItem('lang') || 'en';
    let dictLang = dict[lang];
    content.innerHTML = `<div id="lobby" class="lobby">
                            <div id="choiceText" class="header2">Create room or join to existing room</div>
                            <div id="choiceButtons">
                                <button id="btnCreate" class="white-button big-button">Create</button>
                                <button id="btnJoin" class="white-button big-button">Join</button>
                            </div>
                        </div>`;
}