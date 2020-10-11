import React from "react";

const Main = (props) => {
    const screenShareHandler = (e) => {
        props.history.push("/screenshare");
    };
    const videoShareHandler = (e) => {
        props.history.push("/videoshare");
    };

    return (
        <div className="share-container">
            <button onClick={screenShareHandler} className="screen-btn btn-round">
                Share Screen
            </button>
            <button onClick={videoShareHandler} className="video-btn btn-round">
                Share Video
            </button>
        </div>
    );
};

export default Main;
