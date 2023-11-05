import { ref, onDisconnect, onValue, set, child } from 'firebase/database';
import db, { getUserID } from './firebase.js';
import { dict } from './lang.js';

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
                rounds = shuffleSettings.rounds;
                players = shuffleSettings.players;
                mode = shuffleSettings.mode;
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
                rounds = shuffleSettings.rounds;
                players = shuffleSettings.players;
                playersList = Object.keys(players).sort();
                mode = shuffleSettings.mode;

                let shuffleInputText = document.getElementById("shuffleInputText");
                let btnShuffleReady = document.getElementById("btnShuffleReady");

                btnShuffleReady.addEventListener("click", () => {
                    set(child(shuffleRef, "rounds/" + round + "/" + userID + "/text"), shuffleInputText.value);
                });

                onValue(child(shuffleRef, "rounds/" + round), (snapshot) => {
                    let roundData = snapshot.val();
                    let countready = 0;
                    for (let player in roundData) {
                        if (roundData[player].text != null) {
                            countready++;
                        }
                    }
                    if (countready == playersList.length) {
                        console.log("All players ready");
                    }
                });
                
            });
        });
    });

}


