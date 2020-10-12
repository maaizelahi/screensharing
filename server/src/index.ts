import express, { Request, Response } from "express";
import cors from "cors";
import socket from "socket.io";
import { screenRouter } from "./routes";

// Starting http server and socketio
const PORT = process.env.PORT || 4000;
const app = express();
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
const io = socket(server);

app.use(cors());
app.use(screenRouter);

// Listening for socket connections
io.on("connection", (socket) => {
    // Join used with userId to screen with screenId
    socket.on("join", ({ screenId, userId, isSharing }, callback) => {
        // Join the screen
        socket.join(screenId);
        // If the user is not the one sharing the screen

        if (isSharing !== "true") {
            socket.to(screenId).broadcast.emit("user-connected", userId);
        }

        socket.on("disconnect", () => {
            socket.to(screenId).broadcast.emit("user-disconnected", userId);
        });
    });
});
