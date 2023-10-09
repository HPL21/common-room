import db from './firebase.js';
import { playerRef, userID } from "./firebase.js";
import { onValue, push, ref, set, get } from "firebase/database";

document.getElementById('username').innerHTML = localStorage.getItem('username');

export function handleProfileSettings() {
    let btnUpdate = document.getElementById('btnUpdate');
    btnUpdate.addEventListener('click', () => {
        let username = document.getElementById('usernameInput').value;
        if (username == '') {
            alert('Please enter a username');
            return;
        }
        localStorage.setItem('username', username);
        set(playerRef, { username: username });
        document.getElementById('username').innerHTML = username;
    });
}

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
        console.log(colorHistory);
    }

    function handleClearButtonClick() {
        const yes = confirm("Are you sure you wish to clear the canvas?");

        if (!yes) return;

        drawingContext.fillStyle = "#ffffff";
        drawingContext.fillRect(0, 0, canvas.width, canvas.height);
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
        let canvasRef = ref(db, 'players/' + userID + '/canvas');
        let canvasData = canvas.toDataURL();
        set(canvasRef, { data: canvasData });
    }

    function loadCanvas() {
        //Load canvas from firebase
        let canvasRef = ref(db, 'players/' + userID + '/canvas');
        get(canvasRef).then((snapshot) => {
            let canvasData = snapshot.val().data;
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


