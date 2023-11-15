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

                if(timemin < 10 || timemax < 10) { // Check if there are enough time - at least 10
                    alert("Invalid time");
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
    let timemin;
    let timemax;
    let timeArray;
    let theme;

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

                timeArray = calculateTime(rounds, timemin, timemax);

                theme = getTheme("normal");
                     
                if (gottaSettings.status == "finished") 
                    showResults(gottaRef); // Show results if game is finished
                else
                    processRound(round, rounds, timeArray, userID, gottaRef, theme); // Start the game
            });
        });
    });
}

function calculateTime(rounds, timemin, timemax) {
    let delta = timemax - timemin;
    let timeArray = [];
    timeArray.push(timemin);
    for(let i = 1; i < rounds - 1; i++) {
        timeArray.push(timemin + Math.floor(i * (delta/(rounds - 1))));
    }
    timeArray.push(timemax);
    return timeArray;
}

function getTheme(mode) {
    if (mode == "ChatGPT") {
        return "Coming soon";
    }
    else if (mode == "normal") {
        const themeArray = [
            "Leśny krajobraz.",
            "Latarnia morska przy wschodzie słońca.",
            "Dziecko grające na trampolinie.",
            "Stary zegar nawijany.",
            "Dziki zachód z koniem i kaktusami.",
            "Wodospad otoczony tropikalną dżunglą.",
            "Kolorowy karuzela na tle nocnego nieba.",
            "Mały robak na dużym liściu.",
            "Magiczny zamek na szczycie góry.",
            "Uliczny muzyk grający na saksofonie."
          ];
        return themeArray[Math.floor(Math.random() * themeArray.length)];
    }
}

async function processRound(round, rounds, timeArray, userID, gottaRef, theme){
    
    let lang = localStorage.getItem('lang') || 'en';
    let dictLang = dict[lang];

    if(round > rounds) { // If all rounds are finished, finish the game
        set(child(gottaRef, "settings/status"), "finished");
        displayTransition(dictLang.gottaresults, 3).then(() => {
            showResults(gottaRef);
        });
        return;
    }

    document.getElementById("content").innerHTML = ""; // Clear content

    let time = timeArray[round - 1]; // Get time for current round

    displayTransition(dictLang.round + round + ", " + dictLang.drawingtime + ": " + time, 3).then(() => {
        loadGottaRound();
        displayTheme(theme);
        countdown(time);
        draw(time).then((data) => {
            set(child(gottaRef, "rounds/" + round + "/" + userID), data); // Save picture to database
            processRound(round + 1, rounds, timeArray, userID, gottaRef, theme);
        });
    });
}

function showResults(gottaRef) {

    let lang = localStorage.getItem('lang') || 'en';
    let dictLang = dict[lang];

    let content = document.getElementById("content");
    content.innerHTML = "";
    let roundsList = document.createElement("div");
    roundsList.id = "roundsList";
    roundsList.classList.add("rounds-list");

    let finishButton = document.createElement("button");
    finishButton.innerHTML = dictLang.finishandreturn;
    finishButton.classList.add("red-button");
    finishButton.addEventListener("click", () => {
        get(gottaRef).then((snapshot) => {
            let gottaData = snapshot.val();
            try {
                if (gottaData.settings.status == "finished") {
                    set(gottaRef, null); // Delete shuffle from database
                }
            } catch (error) {
                console.error(error);
            }
            localStorage.setItem('currentPlace', 'menu');
            location.reload(); // Reload page
            return;
        });
    });

    let snapshot, settings, rounds;
    get(gottaRef).then((_snapshot) => {
        snapshot = _snapshot.val(); 
        settings = snapshot.settings;
        rounds = snapshot.rounds;

        for (let round in rounds) {
            let roundBtn = document.createElement("button");
            roundBtn.innerHTML = dictLang.round + round;
            roundBtn.classList.add("white-button");
            roundBtn.addEventListener("click", () => {
                try {
                    showRound(round, rounds[round]); // Show round
                } catch (error) {
                    alert(dictLang.errorloadinground);
                    console.error(error);
                }
            });
            roundsList.appendChild(roundBtn);
        }

        content.appendChild(roundsList);
        content.appendChild(finishButton);
    });
}

async function showRound(round, roundData) {

    console.log("test");

    let lang = localStorage.getItem('lang') || 'en';
    let dictLang = dict[lang];

    let content = document.getElementById("content");
    let roundContent = document.getElementById("roundContent") || document.createElement("div");
    roundContent.id = "roundContent";
    roundContent.innerHTML = "";
    roundContent.classList.add("round-content");

    let playersList = Object.keys(roundData).sort(); // Sort players list
    let playersData = {};
    for (let player in playersList) {
        await get(ref(db, 'players/' + playersList[player])).then((snapshot) => {
            let playerData = snapshot.val();
            playersData[playersList[player]] = playerData;
        });
    }

    for (let player in roundData) {
        let image = document.createElement("img");
        image.src = roundData[player];
        image.classList.add("round-image");

        roundContent.appendChild(image);
    }

    content.appendChild(roundContent);
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
            document.getElementById("content").innerHTML = "";
            resolve(canvas.canvas.toDataURL());
        }, time * 1000);
    });

}

async function displayTransition(text, time) {
    let transition = document.createElement("div");
    transition.classList.add("shield");
    let textElement = document.createElement("div");
    textElement.classList.add("shield-text");
    textElement.innerHTML = text;
    transition.appendChild(textElement);
    document.body.appendChild(transition);
    setTimeout(() => {
        transition.style.height = "100%";
    });
    await new Promise((resolve, reject) => {
        setTimeout(() => {
            transition.remove();
            resolve();
        }, time * 1000);
    });
}

function displayTheme(theme){
    let themeDiv = document.getElementById("theme");
    themeDiv.innerHTML = theme;
    themeDiv.style.display = "block";
}