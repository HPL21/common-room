import './firebase.js';
import { auth, getDb, logout, loginEmailPassword, createAccount } from './firebase.js';
import { get, ref } from 'firebase/database';

import './styles.css';

import './canvas.js'
import { initCanvas, closeCanvas } from './canvas.js';

import { dict } from './lang.js';

import { loadMenu, loadCanvas, loadLobby, loadRoomCreator, loadRoomJoin, loadSettings, loadProfileSettings, loadShuffleCreator, loadChat, loadGottaCreator, loadLogin, loadApp } from './contentloader.js';

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
    let dictLang = dict[localStorage.getItem('lang') || 'en'];

    // Reload current page
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
            case 'gottadrawfast':
                loadGottaCreator();
                handleGottaCreator().then((result) => { if (!result) menu(); else { initGotta(); } });
            default:
                break;
        }
    }

    // Load menu
    function menu() {
        loadMenu();
        loadChat();
        handleChat();

        //Some buttons event listeners
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
        let settingsImg = document.getElementById('settingsImg');
        settings.style.display = 'none';
        let isSettingsOpen = false;
        btnSettings.addEventListener('click', () => {
            settings.style.display = isSettingsOpen ? 'none' : 'block';
            isSettingsOpen = !isSettingsOpen;
        });

        // Close settings when clicked outside
        window.addEventListener('click', (e) => {
            if (isSettingsOpen && e.target != btnSettings && e.target != settings && e.target != settingsImg) {
                settings.style.display = 'none';
                isSettingsOpen = false;
            }
        });

        let btnProfileSettings = document.getElementById('btnProfile');
        btnProfileSettings.addEventListener('click', () => {
            loadProfileSettings();
            handleProfileSettings();
            handleProfilePicCreator();
            localStorage.setItem('currentPlace', 'profileSettings');
        });

        // Listen for clicks on cards
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

    //Load lobby (place where you can join or create room)
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

    // Initialize game
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

    // Monitor auth state
    auth.onAuthStateChanged((user) => {
        if (user) {
            loadApp();
            userID = user.uid;
            get(ref(getDb(), 'players/' + userID)).then((snapshot) => {
                let user = snapshot.val();
                roomName = user.room;
                initGame();
            });
            let btnLogout = document.getElementById('btnLogout');
            btnLogout.addEventListener("click", logout);
        }
        else {
            console.log('You are not logged in.');
            loadLogin();
            localStorage.setItem('currentPlace', 'login');
            let btnLogin = document.getElementById('btnLogin');
            let btnSignup = document.getElementById('btnSignup');
            btnLogin.addEventListener("click", loginEmailPassword);
            btnSignup.addEventListener("click", createAccount);
            localStorage.removeItem('username');
            localStorage.removeItem('userID');
            localStorage.removeItem('roomName');
            localStorage.removeItem('profilePic');
        }
    })

})();