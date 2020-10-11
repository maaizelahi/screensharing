import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "./App.css";
import VideoShare from "./component/VideoShare";
import ScreenShare from "./component/ScreenShare";
import Main from "./component/Main";

function App() {
    return (
        <Router>
            <Route path="/" exact component={Main} />
            <Route path="/screenshare" exact component={ScreenShare} />
            <Route path="/screenshare/:id" component={ScreenShare} />
            <Route path="/videoshare/" component={VideoShare} />
            <Route path="/videoshare/:id" exact component={VideoShare} />
        </Router>
    );
}

export default App;
