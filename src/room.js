import { getDb } from './firebase.js';
import { ref, set, get } from "firebase/database";
import { dict } from './lang.js';
import { getUserID } from "./firebase.js";


export async function handleRoomCreator() {

    let lang = localStorage.getItem('lang') || 'en';
    let dictLang = dict[lang];


    return new Promise((resolve, reject) => {

        // Buttons listeners
        function handleRoomCreatorButtons() {
            let btnCreate = document.getElementById("btnCreateRoom");
            let btnCancel = document.getElementById("btnCancelRoom");
            btnCreate.addEventListener("click", checkInput);
            btnCancel.addEventListener("click", returnToLobby);
        }

        async function checkInput() {
            let roomName = document.getElementById("txtRoomName").value;
            let roomPassword = document.getElementById("txtRoomPassword").value;
            let roomDescription = document.getElementById("txtRoomDescription").value;

            let roomRef = ref(getDb(), 'rooms/' + roomName);
            let snapshot = await get(roomRef);

            // Check if room name, password and description are not empty and if room name is not taken
            if (roomName == "" || roomPassword == "" || roomDescription == "") {
                alert(dictLang.alertfill);
            } else if (snapshot.exists()) {
                alert(dictLang.alertroomexists);
            } else {
                createRoom(roomName, roomPassword, roomDescription);
            }
        }

        async function createRoom(roomName, roomPassword, roomDescription) {
            let roomRef = ref(getDb(), 'rooms/' + roomName);

            try {
                await set(roomRef, { // Create room
                    password: roomPassword,
                    description: roomDescription
                });

                let userID = await getUserID();

                set(ref(getDb(), 'players/' + userID + '/room'), roomName); // Set room name to player

                localStorage.setItem('roomName', roomName);
                resolve(dictLang.roomcreated);

            } catch (error) {
                console.error(error);
                reject(dictLang.errorcreatingroom);
            }
        }

        function returnToLobby() {
            resolve(false);
        }

        handleRoomCreatorButtons();
    });
}


export async function handleRoomJoin() {
    return new Promise((resolve, reject) => {

        let lang = localStorage.getItem('lang') || 'en';
        let dictLang = dict[lang];

        // Buttons listeners
        function handleRoomJoinButtons() {
            let btnJoin = document.getElementById("btnJoinRoom");
            let btnCancel = document.getElementById("btnCancelJoinRoom");
            btnJoin.addEventListener("click", checkInput);
            btnCancel.addEventListener("click", returnToLobby);
        }

        function checkInput() {
            let roomName = document.getElementById("txtRoomName").value;
            let roomPassword = document.getElementById("txtRoomPassword").value;

            if (roomName == "" || roomPassword == "") { // Check if room name and password are not empty
                alert(dictLang.alertfill);
            } else {
                joinRoom(roomName, roomPassword);
            }
        }

        async function joinRoom(roomName, roomPassword) {

            let roomRef = ref(getDb(), 'rooms/' + roomName);

            let userID = await getUserID();

            get(roomRef).then((snapshot) => {

                if (snapshot.exists()) {

                    let roomData = snapshot.val();

                    if (roomData.password == roomPassword) {

                        localStorage.setItem('roomName', roomName);
                        set(ref(getDb(), 'players/' + userID + '/room'), roomName);
                        resolve(true);
                    } else {
                        alert(dictLang.passwordError);
                    }

                } else {
                    alert(dictLang.alertroomdoesntexist);
                }
            });
        }

        function returnToLobby() {
            resolve(false);
        }

        handleRoomJoinButtons();
    });
}
