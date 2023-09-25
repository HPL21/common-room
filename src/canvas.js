import p5 from "p5";
import db from './firebase.js';
import { playerRef, userID } from "./firebase.js";
import { onValue, push, ref, set, get } from "firebase/database";
import { dict } from './lang.js';

const paths = [];
const currentPath = [];

let pencilColor = 'black';
let canvasColor = 'white';
let pencilSize = 5;

let pathsRef;
let allPlayersRef = ref(db, 'players');
let allPlayers;
let temp;
let pathID;
let content = document.getElementById('content');


export function initCanvas(){
    let lang = localStorage.getItem('lang') || 'en';
    let dictLang = dict[lang];

    content.innerHTML = `<div id="canvasContainer" class="canvas-container"></div>
    <div id="toolbox" class="toolbox">
        <button id="btnClear" type="button" class="toolbox-button"><img src="./assets/images/clear.png" alt="${dictLang.clear}" title="${dictLang.clear}"></button>
        <div id="colorPicker" class="color-picker" title="${dictLang.color}">
            <input id="btnColor" type="color" class="color-picker-input" value="#ffffff">
            <button class="color-picker-button"><img src="assets/images/choose_color.png"></button>
        </div>
        <div id="sizePicker" class="size-picker">
            ${dictLang.size}<input id="btnSize" type="range" min="1" max="50" value="5" class="">
        </div>
        <button id="btnEraser" type="button" class="toolbox-button"><img src="./assets/images/eraser.png" alt="${dictLang.eraser}" title="${dictLang.eraser}"></button>
        <button id="btnUndo" type="button" class="toolbox-button"><img src="./assets/images/undo.png" alt="${dictLang.undo}" title="${dictLang.undo}"></button>
    </div>`

    let canvasContainer = document.getElementById('canvasContainer');

    new p5((p) => {
        
        p.setup = () => {
            let canvas = p.createCanvas(p.windowWidth * 0.6, p.windowHeight * 0.6);
            canvas.parent(canvasContainer);
            p.background(canvasColor);

            onValue(allPlayersRef, (snapshot) => {
                allPlayers = Object.keys(snapshot.val());
                allPlayers.forEach((player) => {
                    temp = snapshot.val()[player].paths;
                    if(temp != undefined && (player != userID || pathID == undefined)){
                        Object.values(temp).forEach((path) => {
                            paths.push(Object.values(path));
                        });
                    }
                });
                //console.log(paths);
            })
        };

        p.draw = () => {
            if (p.mouseIsPressed && p.mouseX >= 0 && p.mouseX < p.width && p.mouseY >= 0 && p.mouseY < p.height) {
                const point = {
                    x: p.mouseX,
                    y: p.mouseY,
                    color: pencilColor,
                    size: pencilSize,
                };
                currentPath.push(point);
            }
            
            paths.forEach((path) => {
                p.beginShape();
                path.forEach(({ x, y, color, size }) => {
                    p.vertex(x, y);
                    p.strokeWeight(size);
                    p.stroke(color);
                });
                p.endShape();
            });
            
            p.noFill();
        };

        p.mousePressed = () => {
            if (p.mouseX >= 0 && p.mouseX < p.width && p.mouseY >= 0 && p.mouseY < p.height){
                currentPath.length = 0;
                paths.push(currentPath);
            }
        }

        p.mouseReleased = () => {
            if (p.mouseX >= 0 && p.mouseX < p.width && p.mouseY >= 0 && p.mouseY < p.height){
                pathID = userID + Date.now();
                pathsRef = ref(db, 'players/' + userID +'/paths/' + pathID);
                set(pathsRef, {...currentPath});
            }
        }
        
        function closeCanvas(){
            p.remove();
        }

        let btnLogout = document.getElementById('btnLogout');
        let btnClear = document.getElementById('btnClear');
        let btnColor = document.getElementById('btnColor');
        let btnSize = document.getElementById('btnSize');
        let btnEraser = document.getElementById('btnEraser');
        let btnUndo = document.getElementById('btnUndo');
        let canvasContainer = document.getElementById('canvasContainer');

        let previousColor = pencilColor;
        let isEraser = false;

        btnLogout.addEventListener('click', () => {
            closeCanvas();
        });

        btnClear.addEventListener('click', () => {
            allPlayers.forEach((player) => {
                set(ref(db, 'players/' + player + '/paths'), null);
            });
            p.clear();
            p.background(canvasColor);
            paths.length = 0;
            currentPath.length = 0;
            console.log('Canvas cleared');
        });

        btnColor.addEventListener('change', () => {
            pencilColor = btnColor.value;
        });

        btnSize.addEventListener('change', () => {
            pencilSize = btnSize.value;
        });

        btnEraser.addEventListener('click', () => {
            if (isEraser){
                pencilColor = previousColor;
                isEraser = false;
                btnEraser.classList.remove('button-pressed');
            }
            else {
                previousColor = pencilColor;
                pencilColor = canvasColor;
                isEraser = true;
                btnEraser.classList.add('button-pressed');
            }
        });

        btnUndo.addEventListener('click', () => {
            if (paths.length > 0){
                paths.pop();
                set(ref(db, 'players/' + userID + '/paths/' + pathID), null);
                console.log('Undo successful');
            }
            else {
                console.log('Nothing to undo');
            }
        });
    });
}

