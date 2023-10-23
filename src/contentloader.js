import { dict } from './lang.js';
import { AuthErrorCodes } from 'firebase/auth';
import db from './firebase.js';
import { getDatabase, ref, set, get, onValue } from "firebase/database";
import { monitorAuthState } from "./firebase.js";

import cardPNG from './assets/images/card.png';
import clearPNG from './assets/images/clear.png';
import chooseColorPNG from './assets/images/choose_color.png';
import eraserPNG from './assets/images/eraser.png';
import savePNG from './assets/images/save.png';
import undoPNG from './assets/images/undo.png';

document.addEventListener('DOMContentLoaded', () => {
    let profilePic = new Image();
    
    monitorAuthState().then((userID) => {
        get(ref(db, 'players/' + userID)).then((snapshot) => {
            if (snapshot.val() != null) {
                profilePic.src = snapshot.val().profilePic;
            }
            else {
                profilePic.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAFFJREFUOE9jZKAQMOLR/x9NDqtaXAaga4aZhaEemwG4NGM1BN0AQpoxDBmGBoD8SCgcULxNk2iEhTRFCYnoBA7zAiF/4zKQEWQAuZrBhg68AQB0Wg4O59TPLQAAAABJRU5ErkJggg==";
            }
        });
        profilePic.onload = () => {
            document.getElementById('profilePic').src = profilePic.src;
            localStorage.setItem('profilePic', profilePic.src);
        }
    
    });
});


export function loadLogin() {
    let lang = localStorage.getItem('lang') || 'en';
    let dictLang = dict[lang];
    let login = document.getElementById('login');
    login.innerHTML = `<div class="header1">${dictLang.welcome}</div>
                        <form>
                            <div class="group">
                                <label class="d-block">${dictLang.email}</label>
                                <input id="txtEmail" type="email" class="input-text">
                            </div>
                            <div class="group">
                                <label class="d-block">${dictLang.password}</label>
                                <input id="txtPassword" type="password" class="input-text">
                            </div>
                            <button id="btnLogin" type="button" class="white-button">${dictLang.login}</button>
                            <button id="btnSignup" type="button" class="white-button">${dictLang.signup}</button>
                        </form>`;
}

export const showApp = () => {
    login.style.display = 'none';
    app.style.display = 'block';
}

export const showLogin = () => {
    login.style.display = 'flex';
    app.style.display = 'none';
}

export function loadSettings() {
    let lang = localStorage.getItem('lang') || 'en';
    let dictLang = dict[lang];
    document.getElementById('logoutText').innerHTML = dictLang.logout;
}

export function loadMenu() {
    let lang = localStorage.getItem('lang') || 'en';
    let dictLang = dict[lang];
    let content = document.getElementById('content');
    content.innerHTML = `<div class="card-container"><button id="card1" type="button" class="card"><img src="./assets/images/card.png"><div class="card-text">${dictLang.canvas}</div></button>
                          <button id="card2" type="button" class="card"><img src="./assets/images/card.png"><div class="card-text">${dictLang.shuffle}</div></button>
                          <button id="card3" type="button" class="card"><img src="./assets/images/card.png"><div class="card-text"></div></button></div>`;
}

export function loadCanvas() {
    let content = document.getElementById('content');
    let lang = localStorage.getItem('lang') || 'en';
    let dictLang = dict[lang];
    content.innerHTML = `<div id="canvasContainer" class="canvas-container"></div>
    <div id="toolbox" class="toolbox">
        <button id="btnCanvasSettings" type="button" class="toolbox-button"><img src="./assets/images/settings.png" alt="${dictLang.settings}" title="${dictLang.settings}"></button>
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
    </div>
    <div id="canvasSettings" class="canvas-settings">
        <div id="canvasSettingsHeader" class="canvas-settings-header">
            <div class="header2">${dictLang.settings}</div>
        </div>
        <div id="canvasSettingsContent" class="canvas-settings-content">
            <div id="colorPickerCanvas" class="color-picker" title="${dictLang.color}">
                <label>${dictLang.color}</label>
                <input id="btnCanvasColor" type="color" class="color-picker-input" value="#ffffff">
                <button class="color-picker-button"><img src="assets/images/choose_color.png"></button>
            </div>
            <div id="canvasSettingsSize" class="canvas-settings-item">
                <label>${dictLang.width}</label>
                <input id="canvasSettingsWidthInput" type="number" class="input-text">
                <label>${dictLang.height}</label>
                <input id="canvasSettingsHeightInput" type="number" class="input-text">
            </div>
            <div id="canvasSettingsButtons" class="canvas-settings-buttons">
                <button id="btnApply" type="button" class="white-button">${dictLang.apply}</button>
                <button id="btnCancel" type="button" class="white-button">${dictLang.cancel}</button>
            </div>
        </div>
    </div>`;
}

export function loadRoomCreator() {
    let content = document.getElementById('content');
    let lang = localStorage.getItem('lang') || 'en';
    let dictLang = dict[lang];
    content.innerHTML = `<div id="roomCreator" class="creator">
                            <div id="roomCreatorHeader" class="creator-header">
                                <div class="header2">${dictLang.createroom}</div>
                            </div>
                            <div id="roomCreatorContent" class="creator-content">
                                <div id="roomNameInput" class="creator-input creator-item">
                                    <label>${dictLang.roomname}</label>
                                    <input id="txtRoomName" type="text" class="input-text">
                                </div>
                                <div id="roomPasswordInput" class="creator-input creator-item">
                                    <label>${dictLang.password}</label>
                                    <input id="txtRoomPassword" type="password" class="input-text">
                                </div>
                                <div id="roomDescriptionInput" class="creator-input creator-item">
                                    <label>${dictLang.desc}</label>
                                    <textarea id="txtRoomDescription" rows="3" class="input-text description-input"></textarea>
                                </div>
                                <div id="roomCreatorError" class="creator-error creator-item">
                                    <div id="lblRoomCreatorErrorMessage" class="error-message">Error message</div>
                                </div>
                                <div id="roomCreatorButtons" class="creator-item">
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
    content.innerHTML = `<div id="roomJoin" class="creator">
                            <div id="roomJoinHeader" class="creator-header">
                                <div class="header2">${dictLang.joinroom}</div>
                            </div>
                            <div id="roomJoinContent" class="creator-content">
                                <div id="roomNameInput" class="creator-input creator-item">
                                    <label>${dictLang.roomname}</label>
                                    <input id="txtRoomName" type="text" class="input-text">
                                </div>
                                <div id="roomPasswordInput" class="creator-input creator-item">
                                    <label>${dictLang.password}</label>
                                    <input id="txtRoomPassword" type="password" class="input-text">
                                </div>
                                <div id="roomJoinButtons" class="creator-item">
                                    <button id="btnJoinRoom" type="button" class="white-button">${dictLang.join}</button>
                                    <button id="btnCancelJoinRoom" type="button" class="white-button">${dictLang.cancel}</button>
                                </div>
                            </div>
                        </div>`;
}

export function loadLobby() {
    let content = document.getElementById('content');
    let lang = localStorage.getItem('lang') || 'en';
    let dictLang = dict[lang];
    content.innerHTML = `<div id="lobby" class="lobby">
                            <div id="choiceText" class="header2">${dictLang.lobbytext}</div>
                            <div id="choiceButtons">
                                <button id="btnCreate" class="white-button big-button">${dictLang.create}</button>
                                <button id="btnJoin" class="white-button big-button">${dictLang.join}</button>
                            </div>
                        </div>`;
}

export function loadProfileSettings() {
    let content = document.getElementById('content');
    let lang = localStorage.getItem('lang') || 'en';
    let dictLang = dict[lang];
    content.innerHTML = `<div id="profileSettings" class="profile-settings">
                            <label class="d-block">${dictLang.changeusername}</label>
                            <input id="usernameInput" type="text" class="input-text">
                            <button id="btnUpdate" class="white-button">${dictLang.update}</button>
                            <canvas id="pixelCanvas" class="pixel-canvas" width="320" height="320"></canvas>
                            <div id="colorPicker" class="color-picker" title="${dictLang.color}">
                                <input id="btnColor" type="color" class="color-picker-input" value="#ffffff">
                                <button class="color-picker-button"><img src="assets/images/choose_color.png"></button>
                            </div>
                            <button id="btnSave" type="button">${dictLang.save}</button>
                        </div>`;
}

export function loadChat() {
    let chatDiv = document.getElementById('chat');
    let lang = localStorage.getItem('lang') || 'en';
    let dictLang = dict[lang];

    chatDiv.innerHTML  = `<div id="chatContainer" class="chat-container" style="height: 3vh;">
                            <div id="chatHeader" class="chat-header">
                                <div id="chatTitle"></div>
                                <div class="chat-header-buttons">
                                    <button id="btnMax" class="img-button chat-header-button"><img src="./assets/images/maximize.png"></button>
                                    <button id="btnMin" class="img-button chat-header-button"><img src="./assets/images/minimize.png"></button>
                                </div>
                            </div>
                            <div id="messagesContainer" class="messages-container" style="display: none;">
                            </div>
                            <div id="chatInput" class="chat-input" style="display: none;">
                                <input id="inputMessage" class="input-text input-message" type="text" placeholder="Type a message...">
                                <button id="btnSend" class="img-button square-button"><img src="./assets/images/send.png"></button>
                            </div>
                        </div>`;
}

export function loadShuffleCreator() {
    let content = document.getElementById('content');
    let lang = localStorage.getItem('lang') || 'en';
    let dictLang = dict[lang];
    content.innerHTML = `<div id="shuffleCreator" class="creator">
                            <div id="shuffleCreatorHeader" class="creator-header">
                                <div class="header2">title</div>
                            </div>
                            <div id="shuffleCreatorContent" class="creator-input creator-content">
                                <div id="roundInput" class="creator-input">
                                    <label>round</label>
                                    <input id="rounds" class="input-text" type="number" min="1" max="10" value="3">
                                </div>
                                <div id="modeInput" class="creator-input creator-item">
                                    <label>mode</label>
                                    <div id="modeChoiceDiv" class="creator-item">    
                                        <input type="radio" id="mode1" name="mode" value="1" checked>
                                        <label for="mode1">mode1</label>
                                        <input type="radio" id="mode2" name="mode" value="2">
                                        <label for="mode2">mode2</label>
                                    </div>
                                </div>
                                <div id="shuffleCreatorPlayers" class="creator-players creator-item">
                                    <label>players</label>
                                    <div id="shuffleCreatorPlayersContent" class="creator-players-content">
                                        <div id="shuffleCreatorPlayersList" class="creator-players-list">
                                            <div class="player-list-item creator-item"><img id="profilePic" src="./assets/images/profile.png"><div id="username"></div>
                                        </div>
                                    </div>
                                <div id="shuffleCreatorButtons" class="creator-item">
                                    <button id="btnShuffleJoin" class="white-button">join</button>
                                    <button id="btnShuffleLeave" class="white-button">leave</button>
                                    <button id="btnShuffleStart" class="white-button">start</button>
                                </div>
                            </div>
                        </div>`;
}

export function loadShuffle() {
    let content = document.getElementById('content');
    let lang = localStorage.getItem('lang') || 'en';
    let dictLang = dict[lang];
    content.innerHTML = `TEST`;
}
