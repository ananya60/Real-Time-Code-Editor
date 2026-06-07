import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

function Home() {

  const [roomId, setRoomId] = useState("");

  const navigate = useNavigate();

  const createRoom = () => {

    const id = uuidv4();

    navigate(`/editor/${id}`);

  };

  const joinRoom = () => {

    if (roomId.trim() === "") {
      alert("Enter Room ID");
      return;
    }

    navigate(`/editor/${roomId}`);

  };

  return (

    <div style={{textAlign:"center",marginTop:"100px"}}>

      <h1>Real-Time Code Editor</h1>

      <button
        onClick={createRoom}
        style={{padding:"10px 20px",margin:"10px"}}
      >
        Create Room
      </button>

      <br/><br/>

      <input
        type="text"
        placeholder="Enter Room ID"
        value={roomId}
        onChange={(e)=>setRoomId(e.target.value)}
        style={{padding:"8px"}}
      />

      <button
        onClick={joinRoom}
        style={{padding:"10px",marginLeft:"10px"}}
      >
        Join Room
      </button>

    </div>

  );
}

export default Home;