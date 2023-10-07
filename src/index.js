import './firebase.js';
import { auth } from './firebase.js';

import './styles.css';

import './canvas.js'
import { initCanvas } from './canvas.js';

import './lobby.js'

import { dict } from './lang.js';

import { loadMenu, loadCanvas, loadLobby, loadRoomCreator, loadRoomJoin} from './contentloader.js';

import './room.js'

import { handleRoomCreator, handleRoomJoin } from './room.js';

(function() {
  let userRef;
  let users = {};
  let gamemode = 0;
  let lang = localStorage.getItem('lang') || 'en';
  let dictLang = dict[lang];
  let roomName = localStorage.getItem('roomName');

  let btnMenu = document.getElementById('btnMenu');
  btnMenu.addEventListener('click', () => {
    menu();
    localStorage.setItem('currentPlace', 'menu');
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

  function reloadLanguage() {
    switch(gamemode) {
      case 0:
        loadMenu();
        break;
      case 1:
        loadCanvas();
        initCanvas();
        break;
    }
  }

  function menu() {
    loadMenu();
    let cardCanvas = document.getElementById('card1');
    cardCanvas.addEventListener('click', () => {
      gamemode = 1;
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
    }
    else {
      console.log('You are not logged in.');
      localStorage.setItem('currentPlace', 'login');
    }
  })

})();