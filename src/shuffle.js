import { ref, onDisconnect, onValue, set, child } from 'firebase/database';
import db, { getUserID } from './firebase.js';
import { dict } from './lang.js';
import p5 from "p5";
import { loadShuffleCanvas, loadShuffleText } from './contentloader.js';

export async function handleShuffleCreator() {
    localStorage.setItem('currentPlace', 'shuffleCreator');
    let lang = localStorage.getItem('lang') || 'en';
    let dictLang = dict[lang];

    let userID;
    let roomName;
    let shuffleRef;

    let rounds;
    let players;
    let mode;

    return new Promise((resolve, reject) => {
        getUserID().then((_userID) => {
            userID = _userID;
            onValue(ref(db, 'players/' + userID + '/room'), (snapshot) => {
                roomName = snapshot.val();
                shuffleRef = ref(db, 'rooms/' + roomName + '/shuffle');
                onValue(child(shuffleRef, "settings/players"), (snapshot) => {
                    players = snapshot.val();
                    let playersList = document.getElementById("shuffleCreatorPlayersList");
                    playersList.innerHTML = "";
                    for (let player in players) {
                        let playerRef = ref(db, 'players/' + player);
                        let playerDiv = document.createElement('div');
                        playerDiv.classList.add("player-list-item", "creator-item");
                        let playerPic = document.createElement('img');
                        let playerName = document.createElement('div');
                        onValue(playerRef, (snapshot) => {
                            playerPic.src = snapshot.val().profilePic || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAFFJREFUOE9jZKAQMOLR/x9NDqtaXAaga4aZhaEemwG4NGM1BN0AQpoxDBmGBoD8SCgcULxNk2iEhTRFCYnoBA7zAiF/4zKQEWQAuZrBhg68AQB0Wg4O59TPLQAAAABJRU5ErkJggg==";
                            playerName.innerHTML = snapshot.val().username || 'Anonymous';
                        });
                        playerDiv.appendChild(playerPic);
                        playerDiv.appendChild(playerName);
                        playersList.appendChild(playerDiv);
                    }
                });
                onValue(child(shuffleRef, "settings/rounds"), (snapshot) => {
                    rounds = snapshot.val() || 3;
                    document.getElementById("rounds").value = rounds;
                });
                onValue(child(shuffleRef, "settings/mode"), (snapshot) => {
                    mode = snapshot.val() || "mode1";
                    document.getElementById(mode).checked = true;
                });
                onValue(child(shuffleRef, "settings/status"), (snapshot) => {
                    let status = snapshot.val();
                    if(status == "running") {
                        resolve(true); // Resolve with true
                    }
                });
            });
        });

        let joinButton = document.getElementById("btnShuffleJoin");
        joinButton.addEventListener("click", joinGame);

        function joinGame() {
            set(child(shuffleRef, "settings/players/" + userID), true);
        }

        let startButton = document.getElementById("btnShuffleStart");
        startButton.addEventListener("click", startGame);


        async function startGame() {
            onValue(child(shuffleRef, "settings"), (snapshot) => {
                let shuffleSettings = snapshot.val();
                rounds = shuffleSettings.rounds || 3;
                players = shuffleSettings.players;
                mode = shuffleSettings.mode || "mode1";
                console.log(rounds, players, mode);
                if(Object.keys(players).length < 2) {
                    alert("Not enough players");
                    return;
                }
                if(rounds < 1) {
                    alert("Invalid number of rounds");
                    return;
                }
                set(child(shuffleRef, "settings/status"), "running");
                set(child(shuffleRef, "settings/round"), 1);
                resolve(true); // Resolve with true
            });
        }

        let leaveButton = document.getElementById("btnShuffleLeave");
        leaveButton.addEventListener("click", returnToMenu);

        function returnToMenu() {
            localStorage.setItem('currentPlace', 'menu');
            set(child(shuffleRef, "settings/players/" + userID), null); 
            resolve(false); // Resolve with false
        }
        

        let inputRounds = document.getElementById("rounds");
        inputRounds.addEventListener("change", () => {
            set(child(shuffleRef, "settings/rounds"), inputRounds.value);
        });

        let inputMode1 = document.getElementById("mode1");
        inputMode1.addEventListener("change", () => {
            set(child(shuffleRef, "settings/mode"), "mode1");
        });
        let inputMode2 = document.getElementById("mode2");
        inputMode2.addEventListener("change", () => {
            set(child(shuffleRef, "settings/mode"), "mode2");
        });

    });

}

export function initShuffle () {
    
    let userID;
    let roomName;
    let shuffleRef;

    let round;
    let rounds;
    let players;
    let playersList;
    let mode;

    getUserID().then((_userID) => {
        userID = _userID;
        onValue(ref(db, 'players/' + userID + '/room'), (snapshot) => {
            roomName = snapshot.val();
            shuffleRef = ref(db, 'rooms/' + roomName + '/shuffle');
            onValue(shuffleRef, (snapshot) => {
                let shuffleSettings = snapshot.val().settings;
                round = shuffleSettings.round;
                rounds = shuffleSettings.rounds || 3;
                players = shuffleSettings.players;
                playersList = Object.keys(players).sort();
                mode = shuffleSettings.mode || "mode1";

                let i = 1; // Initialize the loop variable outside of the loop

                function processRound(i) {
                    if (i <= rounds) {
                        round = i;
                        set(child(shuffleRef, "settings/round"), i);
                        if (mode == "mode1") {
                            console.log("Loading round " + i + ", mode: pictire first");
                            loadShuffleCanvas();
                            draw().then((imageBase64) => {
                                console.log("Picture for user " + userID + " is ready");
                                set(child(shuffleRef, "rounds/" + i + "/" + userID + "/image"), imageBase64);
                                let countready1 = 0;
                                while (countready1 < playersList.length) {
                                    onValue(child(shuffleRef, "rounds/" + round), (snapshot) => {
                                        let roundData = snapshot.val();
                                        countready1 = 0;
                                        for (let player in roundData) {
                                            if (roundData[player].image != null) {
                                                countready1++;
                                            }
                                        }
                                        //console.log(countready1);
                                        if (countready1 == playersList.length) {
                                            loadShuffleText();
                                            document.getElementById("shuffleCanvas").innerHTML = `<img src=${roundData[playersList[(playersList.indexOf(userID) + 1) % playersList.length]].image}>`;
                                            write().then((text) => {
                                                set(child(shuffleRef, "rounds/" + i + "/" + userID + "/text"), text);
                                            });
                                            let countready2 = 0;
                                            while (countready2 < playersList.length) {
                                                onValue(child(shuffleRef, "rounds/" + round), (snapshot) => {
                                                    let roundData = snapshot.val();
                                                    countready2 = 0
                                                    for (let player in roundData) {
                                                        if (roundData[player].text != null) {
                                                            countready2++;
                                                        }
                                                    }
                                                    if (countready2 == playersList.length) {
                                                        // Continue to the next round
                                                        processRound(i + 1);
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }
                            });
                            
                        } else if (mode == "mode2") {
                            console.log("Loading round " + i + ", mode: text first");
                            loadShuffleText();
                            write().then((text) => {
                                console.log("Text for user " + userID + " is ready");
                                set(child(shuffleRef, "rounds/" + i + "/" + userID + "/text"), text);
                                onValue(child(shuffleRef, "rounds/" + round), (snapshot) => {
                                let roundData = snapshot.val();
                                let countready = 0;
                                for (let player in roundData) {
                                    if (roundData[player].text != null) {
                                        countready++;
                                    }
                                }
                                if (countready == playersList.length) {
                                    loadShuffleCanvas();
                                    document.getElementById("shuffleText").innerHTML = roundData[playersList[(playersList.indexOf(userID) + 1) % playersList.length]].text;
                                    draw().then((imageBase64) => {
                                        set(child(shuffleRef, "rounds/" + i + "/" + userID + "/image"), imageBase64);
                                    });
                                    onValue(child(shuffleRef, "rounds/" + round), (snapshot) => {
                                        let roundData = snapshot.val();
                                        let countready = 0;
                                        for (let player in roundData) {
                                            if (roundData[player].image != null) {
                                                countready++;
                                            }
                                        }
                                        if (countready == playersList.length) {
                                            // Continue to the next round
                                            processRound(i + 1);
                                        }
                                    });
                                }
                                });
                            });
                            
                        }
                    }
                }

                // Start the loop
                processRound(i);                
                
            });
        });
    });

}

async function draw(){

    return new Promise((resolve, reject) => {

        const paths = [];
        const currentPath = [];
        let pencilColor = 'black';
        let pencilSize = 5;

        let canvas;
        let canvasContainer = document.getElementById('canvasContainer');
        
        let canvasObject = new p5((p) => {
            
            p.setup = () => {

                canvas = p.createCanvas(800, 600);
                canvas.parent(canvasContainer);

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
            
            // TODO: close canvas whenever user leaves canvas page, not only on logout
            function closeCanvas(){
                p.remove();
            }

            // Handling buttons
            let btnColor = document.getElementById('btnColor');
            let btnSize = document.getElementById('btnSize');
            let btnShuffleCanvasReady = document.getElementById('btnShuffleCanvasReady');
            let canvasContainer = document.getElementById('canvasContainer');

            // Changes pencil color
            btnColor.addEventListener('change', () => {
                pencilColor = btnColor.value;   
            });

            // Changes pencil size
            btnSize.addEventListener('change', () => {
                pencilSize = btnSize.value;
            });

            // Sends canvas to database
            btnShuffleCanvasReady.addEventListener('click', () => {
                let imageBase64 = canvas.canvas.toDataURL();
                resolve(imageBase64);
            });

        });

    });
}

async function write(){
    return new Promise((resolve, reject) => {
        let shuffleInputText = document.getElementById("shuffleInputText");
        let btnShuffleReady = document.getElementById("btnShuffleReady");

        btnShuffleReady.addEventListener("click", () => {
            resolve(shuffleInputText.value);
        });

    });
}