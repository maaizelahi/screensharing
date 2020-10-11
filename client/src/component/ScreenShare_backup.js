import React, { useState, useEffect } from "react";
import axios from "axios";
import socketIOClient from "socket.io-client";
import { v4 as uuid } from "uuid";
import Peer from "peerjs";

const ENDPOINT = "http://localhost:4000";
let socket;

const ScreenShare = (props) => {
    const [token, setToken] = useState("");
    const [messages, setMessages] = useState("");
    const [viewer, setViewer] = useState(false);
    const [peerCli, setPeerCli] = useState();
    const [stream, setStream] = useState();

    const getToken = async () => {
        const { data } = await axios(`${ENDPOINT}/token`);

        setToken(data);
        console.log(data);
    };

    const startCapture = async (displayMediaOptions) => {
        let captureStream = null;

        try {
            captureStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
        } catch (err) {
            console.error("Error: " + err);
        }
        // gotMedia(captureStream);
        setStream(captureStream);
        return captureStream;
    };

    const shareScreen = async () => {
        const stream = await startCapture();
        if (stream) {
            getToken();
        }
    };

    useEffect(() => {
        if (props.match.params.id) {
            setViewer(true);
        }
        socket = socketIOClient("localhost:4000");

        console.log(socket);

        const token = "123456";
        const user = uuid();
        console.log(uuid());

        const myPeer = new Peer(undefined, {
            host: "localhost",
            port: 3001,
            path: "/",
        });

        setPeerCli(myPeer);
        console.log("settingPeer:", peerCli);

        myPeer.on("open", (id) => {
            socket.emit("join", { token, user: id }, ({ error }) => {
                console.log("Emit Error:", error);
            });
        });

        myPeer.on("call", (call) => {
            console.log("My Peer is calling");
            // call.answer(stream)
            // const video = document.createElement('video')
            // call.on('stream', userVideoStream => {
            //   addVideoStream(video, userVideoStream)
            // })
        });

        socket.on("user-connected", (user) => {
            console.log("User connected:", user);
            connectToNewUser(user, myPeer);
        });

        // CLEAN UP THE EFFECT
        return () => {
            socket.emit("disconnect");
            socket.off();
        };
    }, []);

    useEffect(() => {
        socket.on("message", ({ message }) => {
            console.log("Message:", message);
            setMessages(`${messages}.${message}`);
        });
    }, []);

    const sendMessage = (event) => {
        socket.emit("sendMessage", { token: "123456", message: "Hi there" }, () => {});
    };

    function addVideoStream(video, stream) {
        video.srcObject = stream;
    }

    const connectToNewUser = (userId, myPeer) => {
        const call = myPeer.call(userId);
        console.log(call, userId);
        const video = document.createElement("video");
        call.on("stream", (userVideoStream) => {
            addVideoStream(video, userVideoStream);
        });
        call.on("close", () => {
            video.remove();
        });

        // peers[userId] = call;
    };

    const gotMedia = (stream) => {
        var video = document.querySelector("video");
        video.srcObject = stream;
        video.addEventListener("loadedmetadata", () => {
            video.play();
        });
    };

    return (
        <div>
            {!viewer && (
                <div>
                    <video></video>
                    <button onClick={shareScreen}>Share Screen</button>
                    <button onClick={sendMessage}>Send Message</button>
                    {token && <div>{`Screen Share Url :${ENDPOINT}/${token}`}</div>}
                </div>
            )}
            <div>{messages}</div>
        </div>
    );
};

export default ScreenShare;
