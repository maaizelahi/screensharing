import React, { useState, useEffect } from "react";
import Peer from "peerjs";
import socketIOClient from "socket.io-client";
import axios from "axios";

let socket; // stores current socket instance
let myPeer; // stores current instance of peer
const peers = {}; // Keeps track of all peer connections
let screenId; // Maintains unique screenId
// let viewer = false;
const ENDPOINT = "http://localhost:4000";

const VideoShare = (props) => {
    const [screen, setScreen] = useState(); // Used to display the screen url
    const [viewer, setViewer] = useState(false); // Keeps track whether user is sharing screen or viewing screen

    // Checking if the user is sharing screen or viewing screen
    if (props.match.params.id && !viewer) {
        setViewer(true);
        // viewer = true;
        screenId = props.match.params.id;
    }

    useEffect(() => {
        // Establishing socket connection
        socket = socketIOClient("localhost:4000");

        // Getting instance of peer from peer server
        myPeer = new Peer(undefined, {
            host: "/",
            port: "3001",
        });
        console.log("Viewer", viewer);

        // If the user is viewer(viewing someones screen)
        if (viewer) {
            // Listen for the call from peer who is sharing stream/screen
            myPeer.on("call", (call) => {
                // To complete connecteion with peer answer the call
                call.answer();
                const video = document.createElement("video");
                call.on("stream", (userVideoStream) => {
                    // On recieving the stream add it to the video tag
                    addVideoStream(video, userVideoStream);
                });
            });
        } else {
            // For the user who wants to share screen, diplay the screen share dialogue
            navigator.mediaDevices
                .getUserMedia({
                    video: true,
                    audio: true,
                })
                .then((stream) => {
                    // Listen for new user connection
                    socket.on("user-connected", (userId) => {
                        // When new user is connected, send the stream
                        if (!viewer) {
                            connectToNewUser(userId, stream);
                        }
                    });
                });
        }

        // listen of user disconnect event
        socket.on("user-disconnected", (userId) => {
            // on discsonnect remove that peer from the list
            if (peers[userId]) peers[userId].close();
        });

        // Establish connected with peer server to get the unique peer id
        myPeer.on("open", async (id) => {
            let isSharing = "false";
            if (!viewer) {
                isSharing = "true";
                // Get unique screenid from server, user who wants to view this screen needs to subscribe to the channel whose id is screenId
                await getScreenId();
            }
            socket.emit("join", { screenId, userId: id, isSharing });
        });
    }, []);

    // Gets unique screenId from server
    const getScreenId = async () => {
        const { data } = await axios(`${ENDPOINT}/screenId`);
        setScreen(data);
        console.log("Setting screen:", screenId);
        screenId = data;
    };

    // Calls the new user and sends the media stream
    const connectToNewUser = (userId, stream) => {
        const call = myPeer.call(userId, stream);
        peers[userId] = call;
    };

    // Play the screensharing stream in a video tag
    const addVideoStream = (video, stream) => {
        const videoGrid = document.getElementById("video-grid");
        video.srcObject = stream;
        video.muted = true;
        video.style.className = "video";
        video.addEventListener("loadedmetadata", () => {
            video.play();
        });
        videoGrid.append(video);
    };

    return (
        <div>
            <div id="video-grid"></div>
            {screen && !viewer && <h3 className="teal">{`Screen Url:  http://localhost:3000/videoshare/${screen}`}</h3>}
        </div>
    );
};

export default VideoShare;
