import './firebase.js';
import { auth } from './firebase.js';

import './styles.css';

import './canvas.js'
import { initCanvas } from './canvas.js';

import './lobby.js'
import { menu } from './lobby.js';

(function() {
  let userRef;
  let users = {};
  let mode;

  let btnMenu = document.getElementById('btnMenu');
  btnMenu.addEventListener('click', () => {
    menu();
  });

  function menu() {
    let content = document.getElementById('content');
    content.innerHTML = `<button id="modeCanvas" type="button" class="">Canvas</button>`;
    let modeCanvas = document.getElementById('modeCanvas');
    modeCanvas.addEventListener('click', () => {
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