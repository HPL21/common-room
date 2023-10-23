import db from './firebase.js';
import { ref, set, get } from "firebase/database";
import { dict } from './lang.js';


export async function handleRoomCreator() {

    let lang = localStorage.getItem('lang') || 'en';
    let dictLang = dict[lang];

    return new Promise((resolve, reject) => {
        let result;

        let createButton = document.getElementById("btnCreateRoom");
        createButton.addEventListener("click", checkInput);

        let cancelButton = document.getElementById("btnCancelRoom");
        cancelButton.addEventListener("click", returnToLobby);

        async function checkInput() {
            let roomName = document.getElementById("txtRoomName").value;
            let roomPassword = document.getElementById("txtRoomPassword").value;
            let roomDescription = document.getElementById("txtRoomDescription").value;

            let roomRef = ref(db, 'rooms/' + roomName);
            let snapshot = await get(roomRef);
            if (snapshot.exists()) {
                alert(dictLang.alertroomexists);
            } else
            if (roomName == "" || roomPassword == "" || roomDescription == "") {
                alert(dictLang.alertfill);
            } else {
                createRoom(roomName, roomPassword, roomDescription)
                    .then(() => {
                        resolve(dictLang.roomcreated);
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
                resolve(dictLang.roomcreated);
                result = true;
            } catch (error) {
                console.error(error);
                reject(dictLang.errorcreatingroom);
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
                alert(dictLang.alertfill);
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
                            alert(dictLang.passwordError);
                            result = false;
                        }
                    } else {
                        alert(dictLang.alertroomdoesntexist);
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
