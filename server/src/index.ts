import express, { Request, Response } from "express";
import cors from "cors";
import socket from "socket.io";

import { generateToken } from "./helper";

// Starting http server and socketio
const PORT = process.env.PORT || 4000;
const app = express();
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
const io = socket(server);

interface SharingDictionary {
    token: string;
    userId: string;
    socketId: string;
}

// Keep the dictionary of user who is sharing the screen/video along with his socket Id and sceenId
let sharing: SharingDictionary[] = [];

app.use(cors());

// Listening for socket connections
io.on("connection", (socket) => {
    socket.on("join", ({ token, userId, isSharing }, callback) => {
        let sourceUserId;
        socket.join(token);
        if (isSharing !== "true") {
            // TODO: fix this
            let sharingObj: any = sharing.find((x) => x.token == token);
            if (sharingObj) {
                sourceUserId = sharingObj.userId;
                socket.to(token).broadcast.emit("user-connected", userId);
            }
        } else {
            // Add user to dictionary
            let newSceenSharing: SharingDictionary;
            newSceenSharing = {
                socketId: socket.id,
                token,
                userId,
            };
            sharing.push(newSceenSharing);
        }

        socket.on("disconnect", () => {
            socket.to(token).broadcast.emit("user-disconnected", userId);
        });
    });
});

app.get("/token", async (req: Request, res: Response) => {
    const token = generateToken();
    res.send(token);
});
