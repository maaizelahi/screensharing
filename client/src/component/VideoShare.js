import React, { useState, useEffect } from "react";
import Peer from "peerjs";
import socketIOClient from "socket.io-client";
import axios from "axios";

let socket;
let myPeer;
let viewer = false;
// let screenId = "abc123";
const ENDPOINT = "http://localhost:4000";

const ScreenShare = (props) => {
    const [screenId, setScreenId] = useState("");

    const getScreenId = async () => {
        const { data } = await axios(`${ENDPOINT}/token`);

        setScreenId(data);
        console.log(data);
    };

    useEffect(() => {
        if (props.match.params.id) {
            viewer = true;
            setScreenId(props.match.params.id);
            // setScreenId(props.match.params.id);
        }

        const videoGrid = document.getElementById("video-grid");
        socket = socketIOClient("localhost:4000");
        myPeer = new Peer(undefined, {
            host: "/",
            port: "3001",
        });

        const myVideo = document.createElement("video");
        const myUser = document.createElement("div");
        myVideo.muted = true;
        const peers = {};

        if (viewer) {
            myPeer.on("call", (call) => {
                call.answer();
                const video = document.createElement("video");
                call.on("stream", (userVideoStream) => {
                    addVideoStream(video, userVideoStream, myUser);
                });
            });
        } else {
            navigator.mediaDevices
                .getUserMedia({
                    video: true,
                    audio: true,
                })
                .then((stream) => {
                    getScreenId();
                    console.log(screenId);
                    myPeer.on("call", (call) => {
                        call.answer(stream);
                        const video = document.createElement("video");
                        call.on("stream", (userVideoStream) => {
                            addVideoStream(video, userVideoStream, myUser);
                        });
                    });

                    socket.on("user-connected", (userId) => {
                        if (!viewer) connectToNewUser(userId, stream);
                    });
                });
        }

        socket.on("user-disconnected", (userId) => {
            if (peers[userId]) peers[userId].close();
        });

        myPeer.on("open", (id) => {
            let isSharing = "false";
            if (!viewer) {
                isSharing = "true";
            }
            console.log("Emmiting join");
            socket.emit("join", { token: screenId, userId: id, isSharing });
        });

        function connectToNewUser(userId, stream) {
            const call = myPeer.call(userId, stream);
            peers[userId] = call;
        }

        function addVideoStream(video, stream, myUser) {
            video.srcObject = stream;
            video.muted = true;
            video.style.className = "video";
            video.addEventListener("loadedmetadata", () => {
                video.play();
            });
            videoGrid.append(video);
            videoGrid.append(myUser);
        }
    }, []);

    return (
        <div>
            <div id="video-grid"></div>
            {screenId && !viewer && <h3 className="teal">{`Video Url:  http://localhost:3000/videoshare/${screenId}`}</h3>}
        </div>
    );
};

export default ScreenShare;
