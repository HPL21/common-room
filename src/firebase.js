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

export const auth = getAuth(firebaseApp);
export let userID;

export function getDb() {
    return db;
}

export let playerRef;
export let userName;

// Login using Firebase authentication
export const loginEmailPassword = async () => {
    const loginEmail = document.getElementById("txtEmail").value;
    const loginPassword = document.getElementById("txtPassword").value;

    try {
        await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
        location.reload();
    }
    catch (error) {
        console.log(`There was an error: ${error}`);
    }
}

//Create account using firebase authentication
export const createAccount = async () => {
    const email = document.getElementById("txtEmail").value;
    const password = document.getElementById("txtPassword").value;

    try {
        await createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
            playerRef = ref(db, 'players/' + userCredential.user.uid);
            set(playerRef, { email: email });
            location.reload();
        });
    }
    catch (error) {
        console.log(`There was an error: ${error}`);
    }

}

// Monitor auth state
const monitorAuthState = async () => {
    onAuthStateChanged(auth, user => {
        if (user) { // If user is authenticated

            userID = user.uid;
            playerRef = ref(db, 'players/' + userID);

            onValue(ref(db, 'players/' + userID), (snapshot) => {
                userName = snapshot.val().username || "Anonymous";
                localStorage.setItem('username', userName);
            });
            localStorage.setItem('userID', userID);
        }
        else {
            userID = null;
        }
    })
}

// Logout function
export const logout = async () => {
    console.log("Logging out...");
    await signOut(auth);
    location.reload();
}

// Async function that returns UserID
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

