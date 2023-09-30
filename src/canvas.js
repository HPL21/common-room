import p5 from "p5";
import db from './firebase.js';
import { playerRef, userID } from "./firebase.js";
import { onValue, push, ref, set, get } from "firebase/database";
import { dict } from './lang.js';

const paths = [];
const pathsIDs = [];
const currentPath = [];

let pencilColor = 'black';
let canvasColor = 'white';
let pencilSize = 5;

let pathsRef;
let allPlayersRef = ref(db, 'players');
let allPlayers;
let temp;
let pathID;

export function initCanvas(){

    let canvas;
    let canvasContainer = document.getElementById('canvasContainer');

    new p5((p) => {
        
        p.setup = () => {
            canvas = p.createCanvas(p.windowWidth * 0.6, p.windowHeight * 0.6);
            canvas.parent(canvasContainer);
            p.background(canvasColor);

            onValue(allPlayersRef, (snapshot) => {
                p.background(canvasColor);
                allPlayers = Object.keys(snapshot.val());
                paths.length = 0;
                pathsIDs.length = 0;
                allPlayers.forEach((player) => {
                    temp = snapshot.val()[player].paths;
                    if(temp != undefined){
                        pathsIDs.push(Object.keys(temp));
                        Object.values(temp).forEach((path) => {
                            paths.push(Object.values(path));
                        });
                    }
                });
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
        let btnSave = document.getElementById('btnSave');
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
            if (paths.length > 0){;
                paths.pop();
                pathID = pathsIDs[0].pop();
                set(ref(db, 'players/' + pathID.substr(0,28) + '/paths/' + pathID), null);
                p.background(canvasColor);
                console.log('Undo successful');
            }
            else {
                console.log('Nothing to undo');
            }
        });

        btnSave.addEventListener('click', () => {
            p.saveCanvas(canvas, 'canvas', 'png');
        });

        let btnPaths = document.getElementById('btnPaths');
        let btnPathsIDs = document.getElementById('btnPathsIDs');

        btnPaths.addEventListener('click', () => {
            console.log(paths);
        });

        btnPathsIDs.addEventListener('click', () => {
            console.log(pathsIDs);
        });

    });
}

