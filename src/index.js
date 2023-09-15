import './firebase.js';

import './styles.css';

import './canvas.js'
import { initCanvas } from './canvas.js';


(function() {
  let userID;
  let userRef;
  let users = {};

  function initGame() {
    // if (userID){
    //   initCanvas();
    // }
    // else {
    //   console.log('no user');
    // }
    initCanvas();
  }

  initGame();

})();