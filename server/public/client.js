const socket = io("https://chat-app-c5ih.onrender.com");

const msgInput = document.querySelector("#message");
const nameInput = document.querySelector("#name");
const chatRoomInput = document.querySelector("#room");
const activity = document.querySelector(".activity");
const userList = document.querySelector(".user-list");
const roomList = document.querySelector(".room-list");
const chatDisplay = document.querySelector(".chat-display");

// send message function
function sendMessage(e) {
    e.preventDefault();

    if (nameInput.value && msgInput.value && chatRoomInput.value) {
        socket.emit("message", { text: msgInput.value, name: nameInput.value });

        msgInput.value = "";
    }
    msgInput.focus();
}

// enter a room function
function enterRoom(e) {
    e.preventDefault();

    if (nameInput.value && chatRoomInput.value) {
        socket.emit("enterRoom", {
            name: nameInput.value,
            room: chatRoomInput.value,
        });

        chatDisplay.textContent = "";
    }
}

// listen for messages from the server
socket.on("message", (data) => {
    activity.textContent = "";

    const { name, text, time } = data;

    const li = document.createElement("li");

    li.className = "post";

    if (name === nameInput.value) li.className = "post post--left";
    if ((name !== nameInput.value) & (name !== "admin")) li.className = "post post--right";

    if (name !== "admin") {
        li.innerHTML = `<div class="post__header ${
            name === nameInput.value ? "post__header--user" : "post__header--reply"
        }">
        <span class=""post__header--name>${name}</span>
        <span class=""post__header--time>${time}</span>
        </div>
        <div class="post__text">${text}</div>
        `;
    } else {
        li.innerHTML = `<div class="post__text">${name}: ${text}</div>`;
    }

    document.querySelector(".chat-display").appendChild(li);

    chatDisplay.scrollTop = chatDisplay.scrollHeight;
});

// listens for keypress activity to show who is typing a message
let activityTimer;

socket.on("activity", (name) => {
    activity.textContent = `${name} is typing...`;

    // Clear after 3 seconds
    clearTimeout(activityTimer);
    activityTimer = setTimeout(() => {
        activity.textContent = "";
    }, 3000);
});

//functions

// show users in room
function showUsers(users) {
    userList.textContent = "";

    if (users) {
        userList.innerHTML = `<em>Users in ${chatRoomInput.value}:</em>`;
        users.forEach((user, i) => {
            userList.textContent += ` ${user.name}`;
            if (users.length > 1 && i !== users.length - 1) {
                userList.textContent += ",";
            }
        });
    }
}

// show rooms
function showRooms(rooms) {
    roomList.textContent = "";

    if (rooms) {
        roomList.innerHTML = "<em>Active rooms</em>";
        rooms.forEach((room, i) => {
            roomList.textContent += ` ${room}`;
            if (rooms.length > 1 && i !== rooms.length - 1) {
                roomList.textContent += ",";
            }
        });
    }
}

socket.on("userList", ({ users }) => {
    showUsers(users);
});

socket.on("roomList", ({ rooms }) => {
    showRooms(rooms);
});

// event listeners
document.querySelector(".form-message").addEventListener("submit", sendMessage);
document.querySelector(".form-join").addEventListener("submit", enterRoom);
msgInput.addEventListener("keypress", () => {
    socket.emit("activity", nameInput.value);
});
