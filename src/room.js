let createButton = document.getElementById("btnCreateRoom");
createButton.addEventListener("click", checkInput);


function checkInput() {
    let roomName = document.getElementById("txtRoomName").value;
    let roomPassword = document.getElementById("txtRoomPassword").value;
    let roomDescription = document.getElementById("txtRoomDescription").value;

    console.log(roomName, roomPassword, roomDescription);
}