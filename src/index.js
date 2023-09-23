import './firebase.js';
import { auth } from './firebase.js';

import './styles.css';

import './canvas.js'
import { initCanvas } from './canvas.js';

import './lobby.js'

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
    content.innerHTML = `<div class="card-container"><button id="card1" type="button" class="card"><img src="./assets/images/card.png"><div class="card-text">Canvas</div></button>
                          <button id="card2" type="button" class="card"><img src="./assets/images/card.png"></button>
                          <button id="card3" type="button" class="card"><img src="./assets/images/card.png"></button></div>`;
    let modeCanvas = document.getElementById('card1');
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