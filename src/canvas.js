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
let pathID;

export function initCanvas(){

    let canvas;
    let canvasContainer = document.getElementById('canvasContainer');

    new p5((p) => {
        
        p.setup = () => {

            // Create canvas with dimensions 
            // TODO: user input for canvas size
            canvas = p.createCanvas(p.windowWidth * 0.6, p.windowHeight * 0.6);
            canvas.parent(canvasContainer);

            // Set canvas background color
            // TODO: user input for canvas color
            p.background(canvasColor);

            onValue(allPlayersRef, (snapshot) => {

                // Clear canvas and load paths from database
                p.background(canvasColor);
                allPlayers = Object.keys(snapshot.val());

                // Load paths from database on every change
                paths.length = 0;
                pathsIDs.length = 0;

                // TODO: push pathsIDs to array one by one, sort them and sort paths accordingly
                // Get all paths from database and assign them to 'temp' object 
                let temp = {}, temp2;
                allPlayers.forEach((player) => {
                    temp2 = snapshot.val()[player].paths;
                    if(temp2 != undefined){
                        Object.assign(temp, temp2);
                    }
                });

                // Convert object to array of arrays
                const pathPairs = Object.entries(temp);

                // Sort the array based on keys
                pathPairs.sort((a, b) => a[0].localeCompare(b[0]));

                // Extract the sorted paths and IDs
                const sortedPaths = pathPairs.map((pair) => pair[1]);
                pathsIDs.push(...pathPairs.map((pair) => pair[0]));

                // Push the sorted paths into the 'paths' array
                paths.push(...sortedPaths); 
            })
        };

        // If mouse is pressed on canvas, draw line between previous and current mouse position
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

        // If mouse is pressed on canvas, create new path
        p.mousePressed = () => {
            if (p.mouseX >= 0 && p.mouseX < p.width && p.mouseY >= 0 && p.mouseY < p.height){
                currentPath.length = 0;
                paths.push(currentPath);
            }
        }

        // If mouse is released on canvas, save path to database
        p.mouseReleased = () => {
            if (p.mouseX >= 0 && p.mouseX < p.width && p.mouseY >= 0 && p.mouseY < p.height){
                pathID = Date.now() + userID;
                pathsRef = ref(db, 'players/' + userID +'/paths/' + pathID);
                set(pathsRef, {...currentPath});
            }
        }
        
        // TODO: close canvas whenever user leaves canvas page, not only on logout
        function closeCanvas(){
            p.remove();
        }

        // Handling buttons
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

        // Clears everything from canvas and database
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

        // Changes pencil color
        btnColor.addEventListener('change', () => {
            pencilColor = btnColor.value;
        });

        // Changes pencil size
        btnSize.addEventListener('change', () => {
            pencilSize = btnSize.value;
        });

        // Changes pencil color to canvas color and vice versa
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

        // Removes last path from canvas and database
        btnUndo.addEventListener('click', () => {
            if (paths.length > 0){;
                paths.pop();
                pathID = pathsIDs.pop();
                set(ref(db, 'players/' + pathID.substr(13,41) + '/paths/' + pathID), null);
                p.background(canvasColor);
                console.log('Undo successful');
            }
            else {
                console.log('Nothing to undo');
            }
        });

        // Saves canvas as png
        btnSave.addEventListener('click', () => {
            p.saveCanvas(canvas, 'canvas', 'png');
        });

        // Debugging buttons
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

