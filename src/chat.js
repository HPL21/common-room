import db, { getRoomName } from './firebase.js';
import { getUserID } from "./firebase.js";
import { onValue, ref, set } from "firebase/database";
import { dict } from './lang.js';

export function handleChat () {

    let userID;
    let roomName;
    
    // When userID is ready
    getUserID().then((_userID) => {
        userID = _userID;
        
        // When room name is ready
        getRoomName().then((_roomName) => {
            roomName = _roomName;

            function sendMessage () {
                let message = document.getElementById('inputMessage').value;
                if (message == '') {
                    return;
                }
                let messageRef = ref(db, 'rooms/' + roomName + '/chat/' + Date.now());
                set(messageRef, {
                    sender: userID,
                    message: message
                });
                document.getElementById('inputMessage').value = '';
            }
        
            function displayMessage (message) {
                let userRef = ref(db, 'players/' + message.sender);
        
                let messageContainer = document.getElementById('messagesContainer');
                let messageDiv = document.createElement('div');
                messageDiv.className = 'message';
        
                // Get and set user avatar
                let picDiv = document.createElement('div');
                let pic = document.createElement('img');
                picDiv.className = 'message-pic';
                onValue(userRef, (snapshot) => {
                    pic.src = snapshot.val().profilePic || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAFFJREFUOE9jZKAQMOLR/x9NDqtaXAaga4aZhaEemwG4NGM1BN0AQpoxDBmGBoD8SCgcULxNk2iEhTRFCYnoBA7zAiF/4zKQEWQAuZrBhg68AQB0Wg4O59TPLQAAAABJRU5ErkJggg==";
                });
                picDiv.appendChild(pic);

                // Get and set username and message
                let senderDiv = document.createElement('div');
                senderDiv.className = 'message-username';
                let messageTextDiv = document.createElement('div');
                messageTextDiv.className = 'message-text';
                onValue(userRef, (snapshot) => {
                    senderDiv.innerHTML = snapshot.val().username || 'Anonymous';
                });
                messageTextDiv.innerHTML = sanitizeMessage(message.message);
        
                messageDiv.appendChild(picDiv);
                messageDiv.appendChild(senderDiv);
                messageDiv.appendChild(messageTextDiv);
                messageContainer.appendChild(messageDiv);
            }
        
            let chatRef = ref(db, 'rooms/' + roomName + '/chat');

            // Update chat
            onValue(chatRef, (snapshot) => {
                let messages = snapshot.val() || {};
                let messagePairs = Object.entries(messages);
                let messageContainer = document.getElementById('messagesContainer');
                messageContainer.innerHTML = '';
                messagePairs.forEach((pair) => {
                    displayMessage(pair[1]);
                });

                // Scroll to bottom
                messageContainer.scrollTop = messageContainer.scrollHeight;
            });
        
            let btnSend = document.getElementById('btnSend');
            btnSend.addEventListener('click', sendMessage);
        
            let btnMax = document.getElementById('btnMax');
            let btnMin = document.getElementById('btnMin');
            let messagesContainer = document.getElementById('messagesContainer');
            let chatInput = document.getElementById('chatInput');
            let chatContainer = document.getElementById('chatContainer');
        
            btnMax.addEventListener('click', () => {
                messagesContainer.style.display = "block";
                chatInput.style.display = "flex";
                chatContainer.style.height = "40vh";
            });
        
            btnMin.addEventListener('click', () => {
                messagesContainer.style.display = "none";
                chatInput.style.display = "none";
                chatContainer.style.height = "3vh";
            });
        
            let chatTitle = document.getElementById('chatTitle');
            let dictLang = dict[localStorage.getItem('lang') || 'en'];
            chatTitle.innerHTML = dictLang.chattitle + roomName;

            // Avoid HTML tags injection
            function sanitizeMessage(message) {
                let sanitizedMessage = message;
                sanitizedMessage = sanitizedMessage.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                return sanitizedMessage;
            }
        })
        
    });

    
}