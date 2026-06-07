const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

app.get("/", (req, res) => {
  res.send("Backend running successfully");
});

// ========================
// RUN CODE API
// ========================

app.post("/run", async (req, res) => {
  const { code, language } = req.body;

  try {
    const tempDir = path.join(__dirname, "temp");

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const id = uuidv4();

    let filePath = "";
    let command = "";

    // PYTHON
    if (language === "python") {
      filePath = path.join(tempDir, `${id}.py`);

      fs.writeFileSync(filePath, code);

      command = `python "${filePath}"`;
    }

    // JAVASCRIPT
    else if (language === "javascript") {
      filePath = path.join(tempDir, `${id}.js`);

      fs.writeFileSync(filePath, code);

      command = `node "${filePath}"`;
    }

    // JAVA
    else if (language === "java") {
      filePath = path.join(tempDir, "Main.java");

      fs.writeFileSync(filePath, code);

      command = `cd "${tempDir}" && javac Main.java && java Main`;
    }

    // C++
    else if (language === "cpp") {
      filePath = path.join(tempDir, `${id}.cpp`);

      fs.writeFileSync(filePath, code);

      const exeFile = path.join(tempDir, `${id}.exe`);

      command = `g++ "${filePath}" -o "${exeFile}" && "${exeFile}"`;
    }

    else {
      return res.status(400).json({
        output: "Language not supported",
      });
    }

    exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
      if (error) {
        return res.json({
          output: stderr || error.message,
        });
      }

      res.json({
        output: stdout || stderr || "No Output",
      });
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      output: "Execution failed",
    });
  }
});

// ========================
// SOCKET.IO
// ========================

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", (room) => {
    socket.join(room);

    console.log(`User joined room: ${room}`);
  });

  socket.on("code_change", (data) => {
    socket.to(data.room).emit("receive_code", data.code);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data.message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ========================
// START SERVER
// ========================

server.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});