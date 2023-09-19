import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

import {
    getAuth,
    onAuthStateChanged,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    connectAuthEmulator
} from 'firebase/auth';

import {
    hideLoginError,
    showLoginState,
    showLoginForm,
    showApp,
    showLoginError,
    btnLogin,
    btnSignup,
    btnLogout
} from './ui';

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

export let userID;
export let playerRef;

const loginEmailPassword = async () => {
    const loginEmail = txtEmail.value;
    const loginPassword = txtPassword.value;

    try {
        await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    }
    catch (error) {
        console.log(`There was an error: ${error}`);
        showLoginError(error);
    }
}

const createAccount = async () => {
    const email = txtEmail.value;
    const password = txtPassword.value;

    try {
        await createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
            playerRef = ref(db, 'players/' + userCredential.user.uid);
            set(playerRef, {email: email});
        });
    }
    catch (error) {
        console.log(`There was an error: ${error}`);
        showLoginError(error);
    }

}

const monitorAuthState = async () => {
    onAuthStateChanged(auth, user => {
        if (user) {
            console.log(user);
            showApp();
            showLoginState(user);

            hideLoginError();

            userID = user.uid;
        }
        else {
            showLoginForm();
            lblAuthState.innerHTML = `You're not logged in.`;
        }
    })
}

const logout = async () => {
    await signOut(auth);
}

btnLogin.addEventListener("click", loginEmailPassword);
btnSignup.addEventListener("click", createAccount);
btnLogout.addEventListener("click", logout);

const auth = getAuth(firebaseApp);

monitorAuthState();

