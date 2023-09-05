const express = require("express");
const path = require("path");
const notFound = require("./middlewares/notfound");
const router = require("./routes/router");
const app = express();
const socketio = require("socket.io");
const { onConnection } = require("./Sockets")
const cors = require("cors");
const morgan = require("morgan");
const errorHandler = require("./controller/error/errorhandler");
const PORT = process.env.PORT || 4000;
require("./config/connection");

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, '/views')));
app.use("/static", express.static(path.join(__dirname, '/public')));
app.get("/", (req, res, next) => {
   res.sendFile(path.join(__dirname, "/views", "Welcome.html"));
})
app.use("/api", router);
app.use(notFound);
app.use(errorHandler);


const Server = app.listen(PORT, () => console.log(`Server is started at http://localhost:${PORT}`));

const io = socketio(Server, {
   cors: {
      origin: "*",
   },
});


io.on("connection", (socket) => {
   onConnection(socket, io)
});