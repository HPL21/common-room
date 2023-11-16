import p5 from "p5";
import db from './firebase.js';
import { playerRef, userID, getUserID } from "./firebase.js";
import { onValue, push, ref, set, get } from "firebase/database";
import { dict } from './lang.js';

const paths = [];
const pathsIDs = [];
const currentPath = [];

let canvasColor;
let canvasWidth;
let canvasHeight;
let pencilColor = 'black';
let pencilSize = 5;

let roomName;
let pathsRef;
let pathRef;
let allPlayersRef = ref(db, 'players');

let allPlayers;
let pathID;

let canvasObject;

export function initCanvas(){

    let canvas;
    let canvasContainer = document.getElementById('canvasContainer');
    localStorage.setItem('currentPlace', 'canvas');
    
    canvasObject = new p5((p) => {
        
        p.setup = () => {

            getUserID().then((userID) => {
                get(ref(db, 'players/' + userID)).then((snapshot) => {
                    let user = snapshot.val();
                    roomName = user.room;
                });
            });


            // Create canvas with dimensions 
            onValue(ref(db, 'rooms/' + roomName + '/canvasSettings'), (snapshot) => {
                let canvasSettings = snapshot.val() || {};
                canvasColor = canvasSettings.color || 'white';
                canvasWidth = canvasSettings.width || p.windowWidth * 0.6;
                canvasHeight = canvasSettings.height || p.windowHeight * 0.6;

                canvas = p.createCanvas(canvasWidth, canvasHeight);
                canvas.parent(canvasContainer);

                // Set canvas background color
                p.background(canvasColor);
            });

            pathsRef = ref(db, 'rooms/' + roomName + '/paths');

            onValue(pathsRef, (snapshot) => {

                // Clear canvas and load paths from database
                p.background(canvasColor);

                // Load paths from database on every change
                paths.length = 0;
                pathsIDs.length = 0;

                // Get all paths from database and assign them to 'temp' object 
                let temp = snapshot.val() || {};

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
            if (p.mouseX >= 0 && p.mouseX < p.width && p.mouseY >= 0 && p.mouseY < p.height && !settingsOpen){
                currentPath.length = 0;
                paths.push(currentPath);
            }
        }

        // If mouse is released on canvas, save path to database
        p.mouseReleased = () => {
            if (p.mouseX >= 0 && p.mouseX < p.width && p.mouseY >= 0 && p.mouseY < p.height && !settingsOpen){
                pathID = Date.now() + userID;
                pathRef = ref(db, 'rooms/' + roomName +'/paths/' + pathID);
                set(pathRef, {...currentPath});
            }
        }
        
        // TODO: close canvas whenever user leaves canvas page, not only on logout
        function closeCanvas(){
            p.remove();
        }

        // Handling buttons
        //let btnLogout = document.getElementById('btnLogout');
        let btnCanvasSettings = document.getElementById('btnCanvasSettings');
        let btnClear = document.getElementById('btnClear');
        let btnColor = document.getElementById('btnColor');
        let btnSize = document.getElementById('btnSize');
        let btnEraser = document.getElementById('btnEraser');
        let btnUndo = document.getElementById('btnUndo');
        let btnSave = document.getElementById('btnSave');
        let canvasContainer = document.getElementById('canvasContainer');

        let previousColor = pencilColor;
        let isEraser = false;
        let settingsOpen = false;

        //Opens canvas settings
        btnCanvasSettings.addEventListener('click', () => {
            settingsOpen = true;

            let canvasSettings = document.getElementById('canvasSettings');
            canvasSettings.style.display = 'flex';

            let btnCanvasColor = document.getElementById('btnCanvasColor');
            let canvasWidthInput = document.getElementById('canvasSettingsWidthInput');
            let canvasHeightInput = document.getElementById('canvasSettingsHeightInput');
            let btnApply = document.getElementById('btnApply');
            let btnCancel = document.getElementById('btnCancel');

            btnCanvasColor.addEventListener('change', () => {
                canvasColor = btnCanvasColor.value;
            });

            btnApply.addEventListener('click', () => {
                set(ref(db, 'rooms/' + roomName + '/canvasSettings'), {
                    color: canvasColor || 'white',
                    width: canvasWidthInput.value || canvasWidth,
                    height: canvasHeightInput.value ||  canvasHeight
                });
                canvasSettings.style.display = 'none';
                settingsOpen = false;
            });

            btnCancel.addEventListener('click', () => {
                canvasSettings.style.display = 'none';
                settingsOpen = false;
            });

        });

        // Clears everything from canvas and database
        btnClear.addEventListener('click', () => {
            set(ref(db, 'rooms/' + roomName + '/paths'), null);
            p.clear();
            p.background(canvasColor);
            paths.length = 0;
            currentPath.length = 0;
            console.log('Canvas cleared');
        });

        // Changes pencil color
        btnColor.addEventListener('change', () => {
            if (isEraser){
                previousColor = btnColor.value;
            }
            else {
                pencilColor = btnColor.value;
            }
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
                set(ref(db, 'rooms/' + roomName + '/paths/' + pathID), null);
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
        // let btnPaths = document.getElementById('btnPaths');
        // let btnPathsIDs = document.getElementById('btnPathsIDs');

        // btnPaths.addEventListener('click', () => {
        //     console.log(paths);
        // });

        // btnPathsIDs.addEventListener('click', () => {
        //     console.log(pathsIDs);
        // });

    });

}

export function closeCanvas(){
    canvasObject.remove();
    console.log('Canvas closed inside');
}

