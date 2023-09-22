import './firebase.js';
import { auth } from './firebase.js';

import './styles.css';

import './canvas.js'
import { initCanvas } from './canvas.js';


(function() {
  let userRef;
  let users = {};

  function initGame() {
    initCanvas();
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