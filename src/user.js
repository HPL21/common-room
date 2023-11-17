import { db } from "./firebase.js";
import { playerRef, getUserID, getDb } from "./firebase.js";
import { onValue, push, ref, set, get, update } from "firebase/database";
import { dict } from "./lang.js";

// When userID is ready, set username and avatar
getUserID().then((userID) => {
    let db  = getDb();
    let userRef = ref(db, 'players/' + userID);
    onValue(userRef, (snapshot) => {
        let user = snapshot.val();
        let username = user.username;
        let profilePic = user.profilePic;
        document.getElementById('username').innerHTML = username;
        let image = new Image();
        image.src = profilePic;
        image.onload = () => {
            document.getElementById('profilePic').appendChild(image);
        }
    });
});

// Update username
export function handleProfileSettings() {
    let btnUpdate = document.getElementById('btnUpdate');
    btnUpdate.addEventListener('click', () => {
        let username = document.getElementById('usernameInput').value;
        let dictLang = dict[localStorage.getItem('lang') || 'en'];
        if (username == '') {
            alert(dictLang.enterusername);
            return;
        }
        localStorage.setItem('username', username);
        update(playerRef, { username: username });
        document.getElementById('username').innerHTML = username;
        alert(dictLang.usernamechanged);
    });
}

// Update avatar
export function handleProfilePicCreator() {
    const canvas = document.getElementById("pixelCanvas");
    const btnColor = document.getElementById("btnColor");
    const btnSave = document.getElementById("btnSave");
    const drawingContext = canvas.getContext("2d");

    const CELL_SIDE_COUNT = 16;
    const cellPixelLength = canvas.width / CELL_SIDE_COUNT;
    const colorHistory = {};

    // Initialize the canvas background
    drawingContext.fillStyle = "#ffffff";
    drawingContext.fillRect(0, 0, canvas.width, canvas.height);

    function handleCanvasMousedown(e) {
        // Ensure user is using their primary mouse button
        if (e.button !== 0) {
            return;
        }

        const canvasBoundingRect = canvas.getBoundingClientRect();
        const x = e.clientX - canvasBoundingRect.left;
        const y = e.clientY - canvasBoundingRect.top;
        const cellX = Math.floor(x / cellPixelLength);
        const cellY = Math.floor(y / cellPixelLength);

        fillCell(cellX, cellY);
    }

    function fillCell(cellX, cellY) {
        const startX = cellX * cellPixelLength;
        const startY = cellY * cellPixelLength;

        drawingContext.fillStyle = btnColor.value;
        drawingContext.fillRect(startX, startY, cellPixelLength, cellPixelLength);
        colorHistory[`${cellX}_${cellY}`] = btnColor.value;
    }

    function saveCanvas() {
        //Save canvas to firebase
        let canvasData = canvas.toDataURL();
        update(playerRef, { profilePic: canvasData });
        let dictLang = dict[localStorage.getItem('lang') || 'en'];
        alert(dictLang.avatarchanged);
        location.reload();
    }

    function loadCanvas() {
        //Load canvas from firebase
        get(playerRef).then((snapshot) => {
            let canvasData = snapshot.val().profilePic;
            let image = new Image();
            image.src = canvasData;
            image.onload = () => {
                drawingContext.drawImage(image, 0, 0);
            }
        });
    }

    loadCanvas();

    canvas.addEventListener("mousedown", handleCanvasMousedown);
    btnSave.addEventListener("click", saveCanvas);
}


