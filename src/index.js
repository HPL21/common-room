import './firebase.js';
import { auth, 
         getDb, 
         logout, 
         loginEmailPassword, 
         createAccount } from './firebase.js';
import { get, ref } from 'firebase/database';

import './styles.css';

import { dict } from './lang.js';

import { initCanvas } from './canvas.js';

import { loadMenu, 
        loadCanvas, 
        loadLobby, 
        loadRoomCreator, 
        loadRoomJoin, 
        loadProfileSettings, 
        loadShuffleCreator, 
        loadChat, 
        loadGottaCreator, 
        loadLogin, 
        loadApp } from './contentloader.js';

import { handleRoomCreator, handleRoomJoin } from './room.js';

import { handleProfileSettings, loadUserData } from './user.js';

import { handleChat } from './chat.js';

import { handleShuffleCreator, initShuffle } from './shuffle.js';

import { handleGottaCreator, initGotta } from './gottadrawfast.js'

(function () {
    
    let userID, roomName;

    // Reload current page
    function reloadLanguage() {

        document.getElementById("logoutText").innerHTML = dict[localStorage.getItem('lang') || 'en'].logout;

        let currentPlace = localStorage.getItem('currentPlace');
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

    // Handle buttons
    function handleButtons() {
        //Some buttons event listeners
        let btnMenu = document.getElementById('btnMenu');
        btnMenu.addEventListener('click', () => {
            if (roomName) {
                menu();  
            }
            else {
                lobby();
            }
        });

        let btnEng = document.getElementById('btnEng');
        btnEng.addEventListener('click', () => {
            localStorage.setItem('lang', 'en');
            reloadLanguage();
        });

        let btnPl = document.getElementById('btnPl');
        btnPl.addEventListener('click', () => {
            localStorage.setItem('lang', 'pl');
            reloadLanguage();
        });

        let btnChangeRoom = document.getElementById('btnChangeRoom');
        btnChangeRoom.addEventListener('click', () => {
            lobby();
            
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
        });

        let btnLogout = document.getElementById('btnLogout');
        btnLogout.addEventListener("click", logout);
    }

    function handleLoginButtons() {
        let btnLogin = document.getElementById('btnLogin');
        let btnSignup = document.getElementById('btnSignup');
        btnLogin.addEventListener("click", loginEmailPassword);
        btnSignup.addEventListener("click", createAccount);
    }

    function handleCards() {
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
    }

    function handleLobbyButtons() {
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

    // Load menu
    function menu() {
        localStorage.setItem('currentPlace', 'menu');
        loadMenu(); // Load HTML content
        handleButtons(); // Add event listeners to buttons
        loadChat(); // Load chat
        handleChat(); 
        handleCards(); // Add event listeners to cards
    }

    //Load lobby (place where you can join or create room)
    function lobby() {
        localStorage.setItem('currentPlace', 'lobby');
        loadLobby(); // Load HTML content
        handleButtons(); // Add event listeners to buttons
        handleLobbyButtons(); // Add event listeners to buttons
    }

    // Initialize game
    function initGame(userID) {
        get(ref(getDb(), 'players/' + userID)).then((snapshot) => {
            roomName = snapshot.val().room;
            if(roomName) {
                menu();
            }
            else {
                lobby();
            }
        });
    }

    // Monitor auth state
    auth.onAuthStateChanged((user) => {
        if (user) {
            userID = user.uid;
            loadApp();
            initGame(userID);
        }
        else {
            let lang = localStorage.getItem('lang') || 'en'; // Delete everything except language
            localStorage.clear();
            localStorage.setItem('lang', lang);
            loadLogin();
            handleLoginButtons();
        }
    });

    // Load user data
    loadUserData();

})();
