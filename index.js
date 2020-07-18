const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");

const router = require("./router");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./helper/socketUser");

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on("connection", (socket) => {
  console.log("New socket connection");

  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) {
      return callback(error);
    }

    /* socket.emit("message", {
      user: "admin",
      text: `${user.name}, welcome to the room ${user.room}`,
    });
    socket.broadcast.to(user.room).emit("message", {
      user: "admin",
      text: `${user.name} has joined hahaha`,
    }); */

    socket.join(user.room);

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("startGame", () => {
    const user = getUser(socket.id);

    io.to(user.room).emit("gameStarting");
  });

  socket.on("flip-cards", (messages, callback) => {
    const user = getUser(socket.id);
    let storyPoint = 0;
    for (let i = 0; i < messages.length; i++) {
      storyPoint = storyPoint + messages[i].text;
    }
    storyPoint = storyPoint / messages.length;
    io.to(user.room).emit("flippingCards", storyPoint);
    callback();
  });

  socket.on("resetGame", () => {
    const user = getUser(socket.id);

    io.to(user.room).emit("gameResetting");
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit("message", { user: user.name, text: message });
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    /* if (user) {
      io.to(user.room).emit("message", {
        user: "admin",
        text: `${user.name} has left`,
      });
    } */
  });
});

app.use(router);
app.use(cors());

server.listen(PORT, () => console.log(`Server has started on port: ${PORT}`));
