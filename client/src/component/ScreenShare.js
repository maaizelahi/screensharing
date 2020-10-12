import React, { useState, useEffect } from "react";
import Peer from "peerjs";
import socketIOClient from "socket.io-client";
import axios from "axios";

let socket; // stores current socket instance
let myPeer; // stores current instance of peer
let viewer = false; // Keeps track whether user is sharing screen or viewing screen
const peers = {}; // Keeps track of all peer connections
// let screenId; // Maintains unique screenId
const ENDPOINT = "http://localhost:4000";

const ScreenShare = (props) => {
    const [screenId, setScreenId] = useState("");
    // const [peers, setPeers] = useState([]);

    useEffect(() => {
        // Checking if the user is sharing screen or viewing screen
        if (props.match.params.id) {
            viewer = true;
            // screenId = props.match.params.id;
            setScreenId(props.match.params.id);
        }

        // Establishing socket connection
        socket = socketIOClient("localhost:4000");

        // Getting instance of peer from peer server
        myPeer = new Peer(undefined, {
            host: "/",
            port: "3001",
        });

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
            navigator.mediaDevices.getDisplayMedia().then((stream) => {
                // Get unique screenid from server, user who wants to view this screen needs to subscribe to the channel whose id is screenId
                getScreenId();

                // Listen for new user connection
                socket.on("user-connected", (userId) => {
                    console.log("All");
                    // When new user is connected, send the stream
                    if (!viewer) {
                        console.log("Sharer");
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
        myPeer.on("open", (id) => {
            let isSharing = "false";
            if (!viewer) {
                isSharing = "true";
            }
            socket.emit("join", { screenId, userId: id, isSharing });
        });
    }, []);

    // Gets unique screenId from server
    const getScreenId = async () => {
        const { data } = await axios(`${ENDPOINT}/screenId`);
        // screenId = data;
        setScreenId(data);
        console.log("ScreenId:", data);
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
        video.style.className = "screen";
        video.addEventListener("loadedmetadata", () => {
            video.play();
        });
        videoGrid.append(video);
    };

    return (
        <div>
            <div id="video-grid"></div>
            {screenId && !viewer && <h3 className="teal">{`Screen Url:  http://localhost:3000/screenshare/${screenId}`}</h3>}
        </div>
    );
};

export default ScreenShare;
