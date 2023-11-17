import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, onValue } from "firebase/database";

import {
    getAuth,
    onAuthStateChanged,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from 'firebase/auth';

import { loadApp, loadLogin } from "./contentloader";

// Firebase initialization

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

export function getDb() {
    return db;
}

export let playerRef;
export let userName;

// Login using Firebase authentication
const loginEmailPassword = async () => {
    const loginEmail = document.getElementById("txtEmail").value;
    const loginPassword = document.getElementById("txtPassword").value;

    try {
        await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    }
    catch (error) {
        console.log(`There was an error: ${error}`);
    }
}

//Create account using firebase authentication
const createAccount = async () => {
    const email = document.getElementById("txtEmail").value;
    const password = document.getElementById("txtPassword").value;

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

// TODO: fix logout button
// Monitor auth state
const monitorAuthState = async () => {
    onAuthStateChanged(auth, user => {
        if (user) { // If user is authenticated
            loadApp();

            userID = user.uid;
            playerRef = ref(db, 'players/' + userID);

            onValue(ref(db, 'players/' + userID), (snapshot) => {
                userName = snapshot.val().username || "Anonymous";
                localStorage.setItem('username', userName);
            });
            localStorage.setItem('userID', userID);
            let btnLogout = document.getElementById('btnLogout');
            btnLogout.addEventListener("click", logout);
        }
        else {
            loadLogin();
            let btnLogin = document.getElementById('btnLogin');
            let btnSignup = document.getElementById('btnSignup');
            btnLogin.addEventListener("click", loginEmailPassword);
            btnSignup.addEventListener("click", createAccount);

            localStorage.removeItem('username');
            localStorage.removeItem('userID');
            localStorage.removeItem('roomName');
        }
    })
}

// Logout function
const logout = async () => {
    console.log("Logging out...");
    await signOut(auth);
}

export const auth = getAuth(firebaseApp);
export let userID;

// Async function that returns UserID
export async function getUserID() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, user => {
            if (user) {
                userID = user.uid;
                resolve(userID);
            }
            else {
                console.log("User is not authenticated");
            }
        })
    });
}

// Async function that returns room name
export async function getRoomName() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, user => {
            if (user) {
                get(ref(db, "players/" + user.uid + "/room")).then((snapshot) => {
                    resolve(snapshot.val())
                });
            }
            else {
                reject("User is not authenticated");
            }
        })
    })
}

monitorAuthState();

