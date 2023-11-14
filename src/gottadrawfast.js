import { ref, onDisconnect, onValue, set, child, get } from 'firebase/database';
import db, { getUserID } from './firebase.js';
import { dict } from './lang.js';
import p5 from "p5";
import { loadGottaRound } from './contentloader.js';
import { Configuration, OpenAIApi } from "openai"

export async function handleGottaCreator() {
    localStorage.setItem('currentPlace', 'shuffleCreator');
    let lang = localStorage.getItem('lang') || 'en';
    let dictLang = dict[lang];

    let userID;
    let roomName;
    let gottaRef;

    let rounds = 3;
    let timemin = 30;
    let timemax = 120;
    let players;

    return new Promise((resolve, reject) => {
        getUserID().then((_userID) => {
            userID = _userID;
            onValue(ref(db, 'players/' + userID + '/room'), (snapshot) => {
                roomName = snapshot.val();
                gottaRef = ref(db, 'rooms/' + roomName + '/gottadrawfast');

                onValue(child(gottaRef, "settings/players"), (snapshot) => { // Update players list

                    players = snapshot.val();

                    if (players == null) {
                        return;
                    }

                    let playersList = document.getElementById("gottaCreatorPlayersList");
                    playersList.innerHTML = "";

                    for (let player in players) {
                        let playerRef = ref(db, 'players/' + player);
                        let playerDiv = document.createElement('div');
                        playerDiv.classList.add("player-list-item", "creator-item");
                        let playerPic = document.createElement('img');
                        let playerName = document.createElement('div');

                        onValue(playerRef, (snapshot) => { // Get player data
                            playerPic.src = snapshot.val().profilePic || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAFFJREFUOE9jZKAQMOLR/x9NDqtaXAaga4aZhaEemwG4NGM1BN0AQpoxDBmGBoD8SCgcULxNk2iEhTRFCYnoBA7zAiF/4zKQEWQAuZrBhg68AQB0Wg4O59TPLQAAAABJRU5ErkJggg==";
                            playerName.innerHTML = snapshot.val().username || 'Anonymous';
                        });

                        playerDiv.appendChild(playerPic);
                        playerDiv.appendChild(playerName);
                        playersList.appendChild(playerDiv);
                    }
                });

                onValue(child(gottaRef, "settings/rounds"), (snapshot) => { // Update rounds
                    rounds = snapshot.val();
                    if (rounds == null) {
                        return;
                    }
                    document.getElementById("rounds").value = rounds;
                });

                onValue(child(gottaRef, "settings/timemin"), (snapshot) => { // Update timemin
                    timemin = snapshot.val();
                    if (timemin == null) {
                        return;
                    }
                    document.getElementById("timemin").value = timemin;
                });

                onValue(child(gottaRef, "settings/timemax"), (snapshot) => { // Update timemax
                    timemax = snapshot.val();
                    if (timemax == null) {
                        return;
                    }
                    document.getElementById("timemax").value = timemax;
                });

                onValue(child(gottaRef, "settings/status"), (snapshot) => { // Listen for status change
                    let status = snapshot.val();
                    if(status == "running" || status == "finished") {
                        resolve(true); // Resolve with true
                    }
                });

            });
        });

        let inputRounds = document.getElementById("rounds"); // Update rounds
        inputRounds.addEventListener("change", () => {
            set(child(gottaRef, "settings/rounds"), parseInt(inputRounds.value));
        });

        let inputTimeMin = document.getElementById("timemin"); // Update timemin
        inputTimeMin.addEventListener("change", () => {
            set(child(gottaRef, "settings/timemin"), parseInt(inputTimeMin.value));
        });

        let inputTimeMax = document.getElementById("timemax"); // Update timemax
        inputTimeMax.addEventListener("change", () => {
            set(child(gottaRef, "settings/timemax"), parseInt(inputTimeMax.value));
        });

        let joinButton = document.getElementById("btnGottaJoin");
        joinButton.addEventListener('click', joinGame);

        function joinGame() {
            set(child(gottaRef, "settings/players/" + userID), true);
        }

        let leaveButton = document.getElementById("btnGottaLeave");
        leaveButton.addEventListener("click", returnToMenu);

        function returnToMenu() {
            localStorage.setItem('currentPlace', 'menu');
            set(child(gottaRef, "settings/players/" + userID), null); 
            resolve(false); // Resolve with false
        }

        let startButton = document.getElementById("btnGottaStart");
        startButton.addEventListener("click", startGame);

        async function startGame() {
            get(child(gottaRef, "settings")).then((snapshot) => {

                let gottaSettings = snapshot.val(); // Get settings
                rounds = gottaSettings.rounds || 3; 
                timemin = gottaSettings.timemin || 30;
                timemax = gottaSettings.timemax || 120;
                players = gottaSettings.players;

                if(Object.keys(players).length < 2) { // Check if there are enough players - at least 2
                    alert("Not enough players");
                    return;
                }

                if(rounds < 1) { // Check if there are enough rounds - at least 1
                    alert("Invalid number of rounds");
                    return;
                }

                set(child(gottaRef, "settings/status"), "running"); // Set status to running
                set(child(gottaRef, "settings/round"), 1); // Set round to 1

                resolve(true); // Resolve with true
            });
        }

    });
}

export function initGotta() {
    let userID;
    let roomName;
    let gottaRef;
    
    let round;
    let rounds;
    let players;
    let playersList;
    let timemin;
    let timemax;

    getUserID().then((_userID) => {
        userID = _userID;
        get(ref(db, 'players/' + userID + '/room')).then((snapshot) => {
            roomName = snapshot.val();
            gottaRef = ref(db, 'rooms/' + roomName + '/gottadrawfast');
            get(child(gottaRef,"settings")).then((snapshot) => { // Load settings
                console.log("Gotta draw fast! settings loaded");

                let gottaSettings = snapshot.val(); // Get settings
                round = gottaSettings.round || 1;
                rounds = gottaSettings.rounds || 3; 
                timemin = gottaSettings.timemin || 30;
                timemax = gottaSettings.timemax || 120;
                players = gottaSettings.players;
                playersList = Object.keys(players).sort(); // Sort players list     
                     
                if (gottaSettings.status == "finished") 
                    showResults(gottaRef); // Show results if game is finished
                else
                    processRound(round, rounds, timemin, timemax, userID, playersList, gottaRef); // Start the game
            });
        });
    });
}

async function processRound(round, rounds, timemin, timemax, userID, playersList, gottaRef){
    loadGottaRound();
    draw(10).then((data) => {
        set(child(gottaRef, "rounds/" + round + "/" + userID), data); // Save picture to database
    });
    countdown(10);
}

function showResults(gottaRef) {

}

function countdown(time){
    let timer = document.createElement("div");
    timer.classList.add("timer");
    timer.innerHTML = time;

    let timerInterval = setInterval(() => {
        time--;
        timer.innerHTML = time;
        if(time <= 0) {
            clearInterval(timerInterval);
        }
    }, 1000);

    document.getElementById("content").appendChild(timer);
}
            

async function draw(time){

    const paths = [];
    const currentPath = [];
    let pencilColor = 'black';
    let pencilSize = 5;

    let canvas;
    let canvasContainer = document.getElementById('canvasContainer');
    
    let canvasObject = new p5((p) => {
        
        p.setup = () => {

            canvas = p.createCanvas(800, 600); // Create canvas with dimensions
            canvas.parent(canvasContainer); // Set canvas parent

            // Set canvas background color
            p.background("white");
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
                drawPath(currentPath);
            }
            
            p.noFill();
        };

        function drawPath(path) {
            p.beginShape();
            path.forEach(({ x, y, color, size }) => {
                p.vertex(x, y);
                p.strokeWeight(size);
                p.stroke(color);
            });
            p.endShape();
        }

        function drawPaths(paths) {
            paths.forEach((path) => {
                drawPath(path);
            });
        }

        // If mouse is pressed on canvas, create new path
        p.mousePressed = () => {
            if (p.mouseX >= 0 && p.mouseX < p.width && p.mouseY >= 0 && p.mouseY < p.height){
                currentPath.length = 0;
            }
        }

        p.mouseReleased = () => {
            if (p.mouseX >= 0 && p.mouseX < p.width && p.mouseY >= 0 && p.mouseY < p.height){
                paths.push(JSON.parse(JSON.stringify(currentPath)));
            }
        }
        
        let previousColor = pencilColor;
        let isEraser = false;

        // Handling buttons
        let btnClear = document.getElementById('btnClear');
        let btnColor = document.getElementById('btnColor');
        let btnSize = document.getElementById('btnSize');
        let btnEraser = document.getElementById('btnEraser');
        let btnUndo = document.getElementById('btnUndo');
        let canvasContainer = document.getElementById('canvasContainer');

        // Clears everything from canvas
        btnClear.addEventListener('click', () => {
            p.clear();
            p.background("white");
            paths.length = 0;
            currentPath.length = 0;
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
                pencilColor = "white";
                isEraser = true;
                btnEraser.classList.add('button-pressed');
            }
        });

        // Removes last path from canvas
        btnUndo.addEventListener('click', () => {
            if (paths.length > 0){;
                paths.pop();
                p.background("white");
                drawPaths(paths);
            }
        });

        function closeCanvas(){
            p.remove();
        }

    });

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            canvasObject.remove();
            resolve(canvas.canvas.toDataURL());
        }, time * 1000);
    });

}

