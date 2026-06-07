import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { socket } from "./socket";
import { useParams } from "react-router-dom";
import axios from "axios";

function CodeEditor() {
  const { roomId } = useParams();

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState("");

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.emit("join_room", roomId);

    socket.on("receive_code", (newCode) => {
      setCode(newCode);
    });

    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receive_code");
      socket.off("receive_message");
    };
  }, [roomId]);

  const handleChange = (value) => {
    const newCode = value || "";
    setCode(newCode);

    socket.emit("code_change", {
      room: roomId,
      code: newCode,
    });
  };

  const runCode = async () => {
    setOutput("Running...");

    try {
      const response = await axios.post("http://localhost:5000/run", {
        code,
        language,
      });

      setOutput(response.data.output || "No Output");
    } catch (error) {
      console.log(error);
      setOutput(error.response?.data?.output || "Error running code");
    }
  };

  const sendMessage = () => {
    if (message.trim() === "") return;

    socket.emit("send_message", {
      room: roomId,
      message,
    });

    setMessages((prev) => [...prev, message]);
    setMessage("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Real Time Code Editor</h2>
      <h3>Room: {roomId}</h3>

      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        style={{ marginBottom: "10px", padding: "5px" }}
      >
        <option value="python">Python</option>
        <option value="javascript">JavaScript</option>
        <option value="java">Java</option>
        <option value="cpp">C++</option>
      </select>

      <Editor
        height="60vh"
        language={language}
        theme="vs-dark"
        value={code}
        onChange={handleChange}
      />

      <button
        onClick={runCode}
        style={{ marginTop: "10px", padding: "10px" }}
      >
        Run Code
      </button>

      <h3>Output</h3>

      <pre
        style={{
          background: "#111",
          color: "#0f0",
          padding: "10px",
          minHeight: "40px",
          whiteSpace: "pre-wrap",
        }}
      >
        {output}
      </pre>

      <div style={{ marginTop: "20px" }}>
        <h3>Room Chat</h3>

        <div
          style={{
            height: "150px",
            overflowY: "scroll",
            border: "1px solid gray",
            padding: "10px",
          }}
        >
          {messages.map((msg, index) => (
            <p key={index}>{msg}</p>
          ))}
        </div>

        <input
          type="text"
          placeholder="Type message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ width: "70%", marginTop: "10px" }}
        />

        <button
          onClick={sendMessage}
          style={{ marginLeft: "10px", padding: "5px 10px" }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default CodeEditor;