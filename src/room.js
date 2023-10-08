import db from './firebase.js';
import { playerRef, userID } from "./firebase.js";
import { onValue, push, ref, set, get } from "firebase/database";


export async function handleRoomCreator() {
    return new Promise((resolve, reject) => {
        let result;

        let createButton = document.getElementById("btnCreateRoom");
        createButton.addEventListener("click", checkInput);

        let cancelButton = document.getElementById("btnCancelRoom");
        cancelButton.addEventListener("click", returnToLobby);

        function checkInput() {
            let roomName = document.getElementById("txtRoomName").value;
            let roomPassword = document.getElementById("txtRoomPassword").value;
            let roomDescription = document.getElementById("txtRoomDescription").value;

            if (roomName == "" || roomPassword == "" || roomDescription == "") {
                alert("Please fill in all fields");
            } else {
                createRoom(roomName, roomPassword, roomDescription)
                    .then(() => {
                        resolve("Room created successfully");
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        }

        async function createRoom(roomName, roomPassword, roomDescription) {
            let roomRef = ref(db, 'rooms/' + roomName);
            try {
                await set(roomRef, {
                    password: roomPassword,
                    description: roomDescription
                });
                localStorage.setItem('roomName', roomName);
                resolve("Room created successfully");
                result = true;
            } catch (error) {
                console.error(error);
                reject("Error creating room");
            }
        }

        function returnToLobby() {
            localStorage.setItem('currentPlace', 'lobby');
            result = false;
            resolve(result); // Resolve with false
        }
    });
}


export async function handleRoomJoin() {
    return new Promise((resolve, reject) => {
        let result;

        let joinButton = document.getElementById("btnJoinRoom");
        let cancelButton = document.getElementById("btnCancelJoinRoom");
        joinButton.addEventListener("click", checkInput);
        cancelButton.addEventListener("click", returnToLobby);

        function checkInput() {
            let roomName = document.getElementById("txtRoomName").value;
            let roomPassword = document.getElementById("txtRoomPassword").value;

            if (roomName == "" || roomPassword == "") {
                alert("Please fill in all fields");
            } else {
                joinRoom(roomName, roomPassword)
                    .then((joinResult) => {
                        resolve(joinResult); // Resolve the promise with the result
                    })
                    .catch((error) => {
                        reject(error); // Reject the promise if there's an error
                    });
            }
        }

        function joinRoom(roomName, roomPassword) {
            return new Promise((resolve, reject) => {
                let roomRef = ref(db, 'rooms/' + roomName);
                get(roomRef).then((snapshot) => {
                    if (snapshot.exists()) {
                        let roomData = snapshot.val();
                        if (roomData.password == roomPassword) {
                            localStorage.setItem('roomName', roomName);
                            localStorage.setItem('currentPlace', 'menu');
                            result = true;
                            resolve(result); // Resolve with true
                        } else {
                            alert("Wrong password");
                            result = false;
                        }
                    } else {
                        alert("Room does not exist");
                    }
                }).catch((error) => {
                    console.error(error);
                    reject(error); // Reject the promise if there's an error
                });
            });
        }

        function returnToLobby() {
            localStorage.setItem('currentPlace', 'lobby');
            result = false;
            resolve(result); // Resolve with false
        }
    });
}
