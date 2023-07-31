const socketio = require("socket.io")

exports.onConnection = (socket) => {
    socket.on("join", async ({ user, roomId }, callback) => {
    //   await addUser({ socketId: socket.id, roomId, ...user });
      socket.join(roomId);
      socket.to(roomId).emit("join", { text: `${user} has joined` });
      callback({
        status: socket.id,
      });
    });

    socket.on("disconnect", async () => {
        
    //   await removeUser(socket.id);
    });
  };
  

  const removeUser = async (id) => {
    const user = await OnlineUsers.findOne({ socketId: id });
    if (user) {
      await OnlineUsers.findByIdAndDelete(user._id);
    }
  };