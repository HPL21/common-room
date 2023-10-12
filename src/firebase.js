import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, onValue, onDisconnect, push } from "firebase/database";

import {
    getAuth,
    onAuthStateChanged,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from 'firebase/auth';

import { loadLogin, showApp, showLoginError, hideLoginError, showLogin } from "./contentloader";

export const firebaseConfig = {
    apiKey: "AIzaSyCDbQxGk2gMb8GHlSAsTj2QQzvIE5izQJs",
    authDomain: "commonroom-d0a42.firebaseapp.com",
    databaseURL: "https://commonroom-d0a42-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "commonroom-d0a42",
    storageBucket: "commonroom-d0a42.appspot.com",
    messagingSenderId: "890131247429",
    appId: "1:890131247429:web:d57833501c63fd7528ce2c",
    measurementId: "G-ZS2BYMW5B7"
};

export const firebaseApp = initializeApp(firebaseConfig);

const db = getDatabase();

export default db;


export let playerRef;
export let userName;
let roomName;
let roomRef;
let allPlayersRoomRef;
let playerRoomRef;
let allPlayersRoom = {};

const loginEmailPassword = async () => {
    const loginEmail = txtEmail.value;
    const loginPassword = txtPassword.value;

    try {
        await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    }
    catch (error) {
        console.log(`There was an error: ${error}`);
    }
}

const createAccount = async () => {
    const email = txtEmail.value;
    const password = txtPassword.value;

    try {
        await createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
            playerRef = ref(db, 'players/' + userCredential.user.uid);
            set(playerRef, { email: email });
        });
    }
    catch (error) {
        console.log(`There was an error: ${error}`);
    }

}

export const monitorAuthState = async () => {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, user => {
            if (user) {
                showApp();

                userID = user.uid;
                playerRef = ref(db, 'players/' + userID);

                onValue(ref(db, 'players/' + userID), (snapshot) => {
                    userName = snapshot.val().username || "Anonymous";
                    localStorage.setItem('username', userName);

                    // TODO: do it better
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
                });
                localStorage.setItem('userID', userID);
                let btnLogout = document.getElementById('btnLogout');
                btnLogout.addEventListener("click", logout);
                
                resolve(userID); // Resolve the Promise with the userID
            }
            else {
                loadLogin();
                showLogin();
                let btnLogin = document.getElementById('btnLogin');
                let btnSignup = document.getElementById('btnSignup');
                btnLogin.addEventListener("click", loginEmailPassword);
                btnSignup.addEventListener("click", createAccount);

                localStorage.removeItem('username');
                localStorage.removeItem('userID');
                localStorage.removeItem('roomName');

                reject("User is not authenticated"); // Reject the Promise if user is not authenticated
            }
        })
    });
}

const logout = async () => {
    await signOut(auth);
}

export const auth = getAuth(firebaseApp);
export let userID;

export async function getUserID() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, user => {
            if (user) {
                userID = user.uid;
                resolve(userID);
            }
            else {
                reject("User is not authenticated");
            }
        })
    });
}

monitorAuthState();

