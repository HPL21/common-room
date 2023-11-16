import './firebase.js';
import { auth, db } from './firebase.js';
import { get, ref } from 'firebase/database';

import './styles.css';

import './canvas.js'
import { initCanvas, closeCanvas } from './canvas.js';

import './lobby.js'

import { dict } from './lang.js';

import { loadLogin, loadMenu, loadCanvas, loadLobby, loadRoomCreator, loadRoomJoin, loadSettings, loadProfileSettings, loadShuffleCreator, loadChat, loadGottaCreator } from './contentloader.js';

import './room.js'

import { handleRoomCreator, handleRoomJoin } from './room.js';

import './user.js'
import { handleProfilePicCreator, handleProfileSettings } from './user.js';

import './chat.js'
import { handleChat } from './chat.js';

import './shuffle.js'
import { handleShuffleCreator, initShuffle } from './shuffle.js';

import './gottadrawfast.js'
import { handleGottaCreator, initGotta } from './gottadrawfast.js'

(function () {
    let userID, roomName;

    let btnMenu = document.getElementById('btnMenu');
    btnMenu.addEventListener('click', () => {
        if (roomName) {
            menu();
            localStorage.setItem('currentPlace', 'menu');
        }
        else {
            lobby();
            localStorage.setItem('currentPlace', 'lobby');
        }
    });

    let btnEng = document.getElementById('btnEng');
    btnEng.addEventListener('click', () => {
        localStorage.setItem('lang', 'en');
        dictLang = dict['en'];
        reloadLanguage();
    });

    let btnPl = document.getElementById('btnPl');
    btnPl.addEventListener('click', () => {
        localStorage.setItem('lang', 'pl');
        dictLang = dict['pl'];
        reloadLanguage();
    });

    let btnChangeRoom = document.getElementById('btnChangeRoom');
    btnChangeRoom.addEventListener('click', () => {
        lobby();
        localStorage.setItem('currentPlace', 'lobby');
    });

    let btnSettings = document.getElementById('btnSettings');
    let settings = document.getElementById('settings');
    settings.style.display = 'none';
    let isSettingsOpen = false;
    btnSettings.addEventListener('click', () => {
        settings.style.display = isSettingsOpen ? 'none' : 'block';
        isSettingsOpen = !isSettingsOpen;
    });

    let btnProfileSettings = document.getElementById('btnProfile');
    btnProfileSettings.addEventListener('click', () => {
        loadProfileSettings();
        handleProfileSettings();
        handleProfilePicCreator();
        localStorage.setItem('currentPlace', 'profileSettings');
    });

    function reloadLanguage() {
        loadSettings();

        let currentPlace = localStorage.getItem('currentPlace') || 'login';
        switch (currentPlace) {
            case 'menu':
                menu();
                break;
            case 'canvas':
                loadCanvas();
                initCanvas();
                break;
            case 'shuffle':
                loadShuffleCreator();
                handleShuffleCreator().then((result) => { if (!result) menu(); else { loadShuffle(); initShuffle(); } });
                break;
            case 'lobby':
                lobby();
                break;
            case 'roomCreator':
                loadRoomCreator();
                handleRoomCreator().then((result) => { if (!result) lobby(); else menu(); });
                break;
            case 'roomJoin':
                loadRoomJoin();
                handleRoomJoin().then((result) => { if (!result) lobby(); else menu(); });
                break;
            case 'profileSettings':
                loadProfileSettings();
                handleProfileSettings();
                break;
        }
    }

    function menu() {
        loadMenu();
        loadChat();
        handleChat();
        let cardCanvas = document.getElementById('card1');
        let cardShuffle = document.getElementById('card2');
        let cardGottaDrawFast = document.getElementById('card3');
        cardCanvas.addEventListener('click', () => {
            loadCanvas();
            initCanvas();
        });
        cardShuffle.addEventListener('click', () => {
            loadShuffleCreator();
            handleShuffleCreator().then((result) => { if (!result) menu(); else { initShuffle(); } });
        });
        cardGottaDrawFast.addEventListener('click', () => {
            loadGottaCreator();
            handleGottaCreator().then((result) => { if (!result) menu(); else { initGotta(); } });
        });

        //TODO: do it better
        try {
            closeCanvas();
        }
        catch (e) { }
    }

    function lobby() {
        loadLobby();
        let btnCreateRoom = document.getElementById('btnCreate');
        btnCreateRoom.addEventListener('click', () => {
            localStorage.setItem('currentPlace', 'roomCreator');
            loadRoomCreator();
            handleRoomCreator().then((result) => { if (!result) lobby(); else menu(); });
        });
        let btnJoinRoom = document.getElementById('btnJoin');
        btnJoinRoom.addEventListener('click', () => {
            localStorage.setItem('currentPlace', 'roomJoin');
            loadRoomJoin();
            handleRoomJoin().then((result) => { if (!result) lobby(); else menu(); });
        });
    }

    function initGame() {
        loadSettings();
        if (roomName) {
            menu();
            localStorage.setItem('currentPlace', 'menu');
        }
        else {
            lobby();
            localStorage.setItem('currentPlace', 'lobby');
        }
    }

    auth.onAuthStateChanged((user) => {
        if (user) {
            userID = user.uid;
            get(ref(db, 'players/' + userID)).then((snapshot) => {
                let user = snapshot.val();
                roomName = user.room;
                initGame();
            });
        }
        else {
            console.log('You are not logged in.');
            localStorage.setItem('currentPlace', 'login');
        }
    })

})();