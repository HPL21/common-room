

export function initShuffle () {
    let roomName;
    let roomRef;
    let allPlayersRoomRef;
    let playerRoomRef;
    let allPlayersRoom = {};
    
    roomName = localStorage.getItem('roomName');
    if(roomName) {
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
}