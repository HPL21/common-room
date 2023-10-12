import './firebase.js';
import { auth } from './firebase.js';

import './styles.css';

import './canvas.js'
import { initCanvas } from './canvas.js';

import './lobby.js'

import { dict } from './lang.js';

import { loadLogin, loadMenu, loadCanvas, loadLobby, loadRoomCreator, loadRoomJoin, loadSettings, loadProfileSettings} from './contentloader.js';

import './room.js'

import { handleRoomCreator, handleRoomJoin } from './room.js';

import './user.js'
import { handleProfilePicCreator, handleProfileSettings } from './user.js';

import './chat.js'

(function() {
  let userID;
  let userRef;
  let users = {};
  let lang = localStorage.getItem('lang') || 'en';
  let dictLang = dict[lang];
  let roomName = localStorage.getItem('roomName');

  let btnMenu = document.getElementById('btnMenu');
  btnMenu.addEventListener('click', () => {
    roomName = localStorage.getItem('roomName');
    if(roomName) {
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
    switch(currentPlace) {
      case 'menu':
        menu();
        break;
      case 'canvas':
        loadCanvas();
        initCanvas();
        break;
      case 'lobby':
        lobby();
        break;
      case 'roomCreator':
        loadRoomCreator();
        handleRoomCreator().then((result) => {if(!result) lobby(); else menu();});
        break;
      case 'roomJoin':
        loadRoomJoin();
        handleRoomJoin().then((result) => {if(!result) lobby(); else menu();});
        break;
      case 'profileSettings':
        loadProfileSettings();
        handleProfileSettings();
        break;
    }
  }

  function menu() {
    loadMenu();
    let cardCanvas = document.getElementById('card1');
    cardCanvas.addEventListener('click', () => {
      loadCanvas();
      initCanvas();
    });
  }

  function lobby() {
    loadLobby();
    let btnCreateRoom = document.getElementById('btnCreate');
    btnCreateRoom.addEventListener('click', () => {
      localStorage.setItem('currentPlace', 'roomCreator');
      loadRoomCreator();
      handleRoomCreator().then((result) => {if(!result) lobby(); else menu();});
    });
    let btnJoinRoom = document.getElementById('btnJoin');
    btnJoinRoom.addEventListener('click', () => {
      localStorage.setItem('currentPlace', 'roomJoin');
      loadRoomJoin();
      handleRoomJoin().then((result) => {if(!result) lobby(); else menu();});
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
      initGame();
      userID = user.uid;
    }
    else {
      console.log('You are not logged in.');
      localStorage.setItem('currentPlace', 'login');
    }
  })

})();