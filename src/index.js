import './firebase.js';
import { auth } from './firebase.js';

import './styles.css';

import './canvas.js'
import { initCanvas } from './canvas.js';

import './lobby.js'

import { dict } from './lang.js';

import { loadMenu, loadCanvas } from './contentloader.js';

(function() {
  let userRef;
  let users = {};
  let gamemode = 0;
  let lang = localStorage.getItem('lang') || 'en';
  let dictLang = dict[lang];

  let btnMenu = document.getElementById('btnMenu');
  btnMenu.addEventListener('click', () => {
    menu();
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

  function initGame() {
    menu();
  }

  auth.onAuthStateChanged((user) => {
    if (user) {
      initGame();
    }
    else {
      console.log('You are not logged in.');
    }
  })

})();