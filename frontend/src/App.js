import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Editor from "./Editor";
import Home from "./Home";

function App() {

  return (

    <Router>

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/editor/:roomId" element={<Editor />} />

      </Routes>

    </Router>

  );

}

export default App;