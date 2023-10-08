import db from './firebase.js';
import { playerRef, userID } from "./firebase.js";
import { onValue, push, ref, set, get } from "firebase/database";

document.getElementById('username').innerHTML = localStorage.getItem('username');

export function handleProfileSettings() {
    let btnUpdate = document.getElementById('btnUpdate');
    btnUpdate.addEventListener('click', () => {
        let username = document.getElementById('usernameInput').value;
        if(username == '') {
            alert('Please enter a username');
            return;
        }
        localStorage.setItem('username', username);
        set(playerRef, { username: username });
        document.getElementById('username').innerHTML = username;
    });
}
