import { ref, onDisconnect, onValue, set } from 'firebase/database';

export async function handleShuffleCreator() {
    let lang = localStorage.getItem('lang') || 'en';
    let dictLang = dict[lang];

    return new Promise((resolve, reject) => {

        let startButton = document.getElementById("btnShuffleStart");
        startButton.addEventListener("click", startGame);

        async function startGame() {
            let roomName = localStorage.getItem('roomName');
            let roomRef = ref(db, 'rooms/' + roomName);
            let roomSettingsRef = ref(db, 'rooms/' + roomName + '/shuffleSettings');
            let snapshot = await get(roomRef);
            if (snapshot.exists()) {
                alert(dictLang.alertroomexists);
            } else {
                createRoom(roomName)
                    .then(() => {
                        resolve(dictLang.roomcreated);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        }

        let cancelButton = document.getElementById("btnShuffleCancel");
        cancelButton.addEventListener("click", returnToLobby);

        function returnToLobby() {
            localStorage.setItem('currentPlace', 'lobby');
            result = false;
            resolve(result); // Resolve with false
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