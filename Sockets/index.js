const socketio = require("socket.io");
const UserModel = require("../model/user");

exports.onConnection = (socket, io) => {
  console.log("----- IO-ROOMS-B ------ ", socket.rooms);
  console.log("----- IO ------ ", socket.id);
  socket.on("join", async ({ UserId }, callback) => {
    console.log("----- IO-JOIN ------ ", UserId);
    let UserData = await UserModel.findById(UserId);
    socket.join(String(UserData?._id));
    io.to("649358c3dba23d55db5e72fa").emit("coming", { text: `${UserData?.firstName} ${UserData?.lastName} has joined` });

    console.log("----- IO-ROOMS-F ------ ", socket.rooms);

    callback({
      status: socket.id,
    });
  });

  socket.on("disconnect", async () => {
    console.log("----- IO-ROOMS-END ------ ", socket.rooms);
    console.log("----- IO-END ------ ");
    //   await removeUser(socket.id);
  });
};


const removeUser = async (id) => {
  const user = await OnlineUsers.findOne({ socketId: id });
  if (user) {
    await OnlineUsers.findByIdAndDelete(user._id);
  }
};