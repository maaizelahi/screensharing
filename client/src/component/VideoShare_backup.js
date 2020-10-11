import React, { useState, useEffect } from "react";
import Peer from "peerjs";
import socketIOClient from "socket.io-client";

let socket;
let myPeer;
let viewer = false;
let screenId = "abc123";

const VideoShare = (props) => {
    // const [viewer, setViewer] = useState(false);
    // const [screenId, setScreenId] = useState("abc123");

    useEffect(() => {
        if (props.match.params.id) {
            viewer = true;
            screenId = props.match.params.id;
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

        navigator.mediaDevices
            .getUserMedia({
                video: true,
                audio: true,
            })
            .then((stream) => {
                myUser.innerHTML += myPeer.id;
                // addVideoStream(myVideo, stream, myUser);

                myPeer.on("call", (call) => {
                    console.log("Call called:", call);
                    call.answer(stream);
                    const video = document.createElement("video");
                    call.on("stream", (userVideoStream) => {
                        console.log("On stream called");
                        myUser.innerHTML += call.id;
                        addVideoStream(video, userVideoStream, myUser);
                    });
                });

                socket.on("user-connected", (userId) => {
                    console.log("User Connected:", userId, viewer);
                    if (!viewer) connectToNewUser(userId, stream);
                });
            });

        socket.on("user-disconnected", (userId) => {
            console.log("User Disconnected:", userId);
            if (peers[userId]) peers[userId].close();
        });

        myPeer.on("open", (id) => {
            let isSharing = "false";
            console.log("Viewer:", viewer);
            if (!viewer) {
                isSharing = "true";
            }
            console.log("emitting join");
            socket.emit("join", { token: screenId, userId: id, isSharing });
        });

        function connectToNewUser(userId, stream) {
            const call = myPeer.call(userId, stream);
            // const video = document.createElement("video");
            // call.on("stream", (userVideoStream) => {
            //     addVideoStream(video, userVideoStream);
            // });
            // call.on("close", () => {
            //     video.remove();
            // });

            peers[userId] = call;
        }

        function addVideoStream(video, stream, myUser) {
            video.srcObject = stream;
            video.addEventListener("loadedmetadata", () => {
                video.play();
            });
            videoGrid.append(video);
            videoGrid.append(myUser);
        }
    }, []);

    return <div id="video-grid"></div>;
};

export default VideoShare;
