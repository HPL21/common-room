import { ref, onDisconnect, onValue, set } from 'firebase/database';

export function handleShuffleCreator() {
    console.log('Shuffle creator loaded.');
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