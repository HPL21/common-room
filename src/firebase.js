import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, onValue } from "firebase/database";

import {
    connectAuthEmulator,
    getAuth,
    onAuthStateChanged,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from 'firebase/auth';


// Firebase initialization

export const firebaseConfig = {
    // Your web app's Firebase configuration

};

export const firebaseApp = initializeApp(firebaseConfig);

const db = getDatabase();

export function getDb() {
    return db;
}

export const auth = getAuth(firebaseApp);
connectAuthEmulator(auth, "http://localhost:9099");

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
            let playerRef = ref(db, 'players/' + userCredential.user.uid);
            set(playerRef, { email: email,
                             username: "Anonymous",
                             profilePic: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAFFJREFUOE9jZKAQMOLR/x9NDqtaXAaga4aZhaEemwG4NGM1BN0AQpoxDBmGBoD8SCgcULxNk2iEhTRFCYnoBA7zAiF/4zKQEWQAuZrBhg68AQB0Wg4O59TPLQAAAABJRU5ErkJggg==",
                             room: null })
                             .then(() => location.reload());
            
        });
    }
    catch (error) {
        console.log(`There was an error: ${error}`);
    }

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
                resolve(user.uid);
            }
            else {
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
            }
        })
    })
}

