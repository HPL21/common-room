import { ref, onDisconnect, onValue, set, child, get } from 'firebase/database';
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
                onValue(child(shuffleRef, "settings/players"), (snapshot) => { // Update players list

                    players = snapshot.val();
                    let playersList = document.getElementById("shuffleCreatorPlayersList");
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

                onValue(child(shuffleRef, "settings/rounds"), (snapshot) => { // Update rounds
                    rounds = snapshot.val() || 3;
                    document.getElementById("rounds").value = rounds;
                });

                onValue(child(shuffleRef, "settings/mode"), (snapshot) => { // Update mode
                    mode = snapshot.val() || "mode1";
                    document.getElementById(mode).checked = true;
                });

                onValue(child(shuffleRef, "settings/status"), (snapshot) => { // Listen for status change
                    let status = snapshot.val();
                    if(status == "running") {
                        resolve(true); // Resolve with true
                    }
                });

            });
        });

        let joinButton = document.getElementById("btnShuffleJoin");
        joinButton.addEventListener("click", joinGame);

        function joinGame() { // Join the game
            set(child(shuffleRef, "settings/players/" + userID), true);
        }

        let startButton = document.getElementById("btnShuffleStart");
        startButton.addEventListener("click", startGame);

        async function startGame() {
            get(child(shuffleRef, "settings")).then((snapshot) => {

                let shuffleSettings = snapshot.val(); // Get settings
                rounds = shuffleSettings.rounds || 3; 
                players = shuffleSettings.players;
                mode = shuffleSettings.mode || "mode1";

                if(Object.keys(players).length < 2) { // Check if there are enough players - at least 2
                    alert("Not enough players");
                    return;
                }

                if(rounds < 1) { // Check if there are enough rounds - at least 1
                    alert("Invalid number of rounds");
                    return;
                }

                set(child(shuffleRef, "settings/status"), "running"); // Set status to running
                set(child(shuffleRef, "settings/round"), 1); // Set round to 1

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
        

        let inputRounds = document.getElementById("rounds"); // Update rounds
        inputRounds.addEventListener("change", () => {
            set(child(shuffleRef, "settings/rounds"), parseInt(inputRounds.value));
        });

        let inputMode1 = document.getElementById("mode1"); // Update mode
        inputMode1.addEventListener("change", () => {
            set(child(shuffleRef, "settings/mode"), "mode1");
        });

        let inputMode2 = document.getElementById("mode2"); // Update mode
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
        get(ref(db, 'players/' + userID + '/room')).then((snapshot) => {
            roomName = snapshot.val();
            shuffleRef = ref(db, 'rooms/' + roomName + '/shuffle');
            get(child(shuffleRef,"settings")).then((snapshot) => { // Load settings
                console.log("Shuffle settings loaded");

                let shuffleSettings = snapshot.val();
                round = shuffleSettings.round || 1;
                rounds = shuffleSettings.rounds || 3;
                players = shuffleSettings.players;
                playersList = Object.keys(players).sort(); // Sort players list
                mode = shuffleSettings.mode || "mode1";      
                     
                processRound(round, rounds, mode, userID, playersList, shuffleRef); // Start the game
            });
        });
    });

}

async function processRound(round, rounds, mode, userID, playersList, shuffleRef) {
    if (round <= rounds) {
        set(child(shuffleRef, "settings/round"), round);
        if (mode == "mode1") {
            console.log("Loading round " + round + ", mode: picture first");
            loadShuffleCanvas(); // Load canvas
            try {
                const imageBase64 = await draw(); // Draw canvas
                set(child(shuffleRef, "rounds/" + round + "/" + userID + "/image"), imageBase64); // Save image to database

                let roundData = await waitForAllPlayers(child(shuffleRef, "rounds/" + round), "image", playersList); // Wait for all players to finish

                loadShuffleText(); // Load text input
                //
                //  TODO: make this prettier
                //
                document.getElementById("shuffleCanvas").innerHTML = `<img class="shuffle-image" src=${roundData[playersList[(playersList.indexOf(userID) + 1) % playersList.length]].image}>`; // Display image from previous player

                const text = await write(); // Write text
                set(child(shuffleRef, "rounds/" + round + "/" + userID + "/text"), text); // Save text to database

                await waitForAllPlayers(child(shuffleRef, "rounds/" + round), "text", playersList); // Wait for all players to finish

                processRound(round + 1, rounds, mode, userID, playersList, shuffleRef); // Start next round
            } catch (error) {
                console.error(error);
            }
        } else if (mode == "mode2") {
            // Handle mode2
        }
    }
    if (round > rounds) {
        set(child(shuffleRef, "settings/status"), "finished"); // Set status to finished
        console.log("Shuffle finished");
        showResults(shuffleRef);
    }
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

        btnShuffleReady.addEventListener("click", () => { // Send text to database
            resolve(shuffleInputText.value);  // Resolve with text
        });

    });
}

async function waitForAllPlayers(ref, mode, playersList){
    return new Promise((resolve, reject) => {
        onValue(ref, (snapshot) => {
            let roundData = snapshot.val();
            let countready = 0;
            for (let player in roundData) {  
                if (mode == "image") {
                    if (roundData[player].image != null) {
                        countready++;
                    }
                } else if (mode == "text") {
                    if (roundData[player].text != null) {
                        countready++;
                    }
                }
            }

            if (countready == playersList.length) { // If all players are ready, resolve with round data
                resolve(roundData);
            }
        });
    });
}

function showResults(shuffleRef) {

    let lang = localStorage.getItem('lang') || 'en';
    let dictLang = dict[lang];

    let content = document.getElementById("content");
    content.innerHTML = "";
    let roundsList = document.createElement("div");

    let snapshot, settings, mode, rounds;
    get(shuffleRef).then((_snapshot) => {
        snapshot = _snapshot.val(); 
        settings = snapshot.settings;
        mode = settings.mode || "mode1";
        rounds = snapshot.rounds;

        for (let round in rounds) {
            let roundBtn = document.createElement("button");
            roundBtn.innerHTML = dictLang.round + round;
            roundBtn.classList.add("round-btn");
            //
            //  TODO: make this button prettier
            //
            roundBtn.addEventListener("click", () => {
                showRound(round, rounds[round], mode); // Show round
            });
            roundsList.appendChild(roundBtn);
        }

        content.appendChild(roundsList);
    });

}

function showRound(round, roundData, mode) {
    let content = document.getElementById("content");
    let roundContent = document.createElement("div");
    roundContent.classList.add("round-content");
    //
    //  TODO: make this prettier
    //

    let playersList = Object.keys(roundData).sort(); // Sort players list

    if (mode == "mode1") {
        for (let player in roundData) {
            let playerDiv = document.createElement("div");
            playerDiv.classList.add("player-div");
            //
            //  TODO: make this prettier
            //
            let playerDataDiv = document.createElement("div");
            let playerPic = document.createElement("img");
            let playerID = document.createElement("div");

            // TODO: get player data from database (username, profile pic)
            playerPic.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAFFJREFUOE9jZKAQMOLR/x9NDqtaXAaga4aZhaEemwG4NGM1BN0AQpoxDBmGBoD8SCgcULxNk2iEhTRFCYnoBA7zAiF/4zKQEWQAuZrBhg68AQB0Wg4O59TPLQAAAABJRU5ErkJggg==";
            playerDataDiv.appendChild(playerPic);
            playerID.innerHTML = player;
            playerDataDiv.appendChild(playerID);
            playerDiv.appendChild(playerDataDiv);

            let playerImage = document.createElement("img");
            playerImage.classList.add("shuffle-image");
            playerImage.src = roundData[playersList[mod(playersList.indexOf(player) + 1, playersList.length)]].image; // Display image from previous player
            let playerText = document.createElement("div");
            playerText.innerHTML = roundData[playersList[mod(playersList.indexOf(player), playersList.length)]].text; // Display text from current player
            playerDiv.appendChild(playerImage);
            playerDiv.appendChild(playerText);
            roundContent.appendChild(playerDiv);
        }
    } else if (mode == "mode2") {
        // Handle mode2
    }

    content.appendChild(roundContent);

}

function mod(n, m) { // Modulo function that works with negative numbers - fixing JS bullshit
    return ((n % m) + m) % m;
}