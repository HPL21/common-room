import { ref, onDisconnect, onValue, set } from 'firebase/database';
import { dict } from './lang.js';

export async function handleShuffleCreator() {
    let lang = localStorage.getItem('lang') || 'en';
    let dictLang = dict[lang];

    return new Promise((resolve, reject) => {

        let startButton = document.getElementById("btnShuffleStart");
        startButton.addEventListener("click", startGame);

        let rounds;
        let players;
        let mode;

        async function startGame() {
            onValue(ref(db, 'rooms/' + roomName + 'shuffle/settings'), (snapshot) => {
                let shuffleSettings = snapshot.val();
                rounds = shuffleSettings.rounds;
                players = shuffleSettings.players;
                mode = shuffleSettings.mode;
            });
        }

        let leaveButton = document.getElementById("btnShuffleLeave");
        leaveButton.addEventListener("click", returnToLobby);

        function returnToLobby() {
            localStorage.setItem('currentPlace', 'lobby');
            resolve(false); // Resolve with false
        }


    });

}

export function initShuffle () {
    let roomName;
    let roomRef;
    let allPlayersRoomRef;
    let playerRoomRef;
    let allPlayersRoom = {};

    roomName = localStorage.getItem('roomName');
    roomRef = ref(db, 'rooms/' + roomName);
    allPlayersRoomRef = ref(db, 'rooms/' + roomName + '/players');
    playerRoomRef = ref(db, 'rooms/' + roomName + '/players/' + userID);
    set(playerRoomRef, { username: userName });
    onDisconnect(playerRoomRef).remove();

    onValue(allPlayersRoomRef, (snapshot) => {
        allPlayersRoom = snapshot.val();
        console.log(allPlayersRoom);
    });


}