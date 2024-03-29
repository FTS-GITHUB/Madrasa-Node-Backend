const socketio = require("socket.io");

const UserModel = require("../model/user");
const OnlineUsersModel = require("../model/onlineUser");
const NotificationModel = require("../model/notifications");
const BookModel = require("../model/book");
const MeetingModel = require("../model/meeting");
const TransactionModel = require("../model/transaction");
const userModel = require("../model/user");





const onConnection = (socket, io) => {
  console.log("----- Client Connected ------ ", socket.id);

  socket.on("join", async ({ UserId }, callback) => {

    console.log("----- Client JOIN ------ ", UserId);

    addOnlineUser(UserId, socket.id)
    // socket.join(String(UserData?._id));
    // socket.join(String(UserData?._id));

    if (typeof callback === "function") callback({
      status: socket.id,
    });
  });

  socket.on("newNotification", async (notificationId, callback) => {
    console.log("------------------------>", notificationId, socket.id);
    try {
      const Notification = await NotificationModel.findById(notificationId).populate("from")
      if (Notification) {
        let UserData = Notification.from
        let allClients = Notification.to
        let FindOnlineUsers = await OnlineUsersModel.find({ userId: { $in: allClients } })
        FindOnlineUsers.map(online => {
          io.to(online.socketId).emit("notification", { message: `${UserData?.firstName} make a payment for ${Notification.type[0].toLocaleUpperCase()}${Notification.type.slice(1)} ` });
        })


        // if (Notification.type == "book") {
        //   let data = await TransactionModel.findById(Notification.source).populate("buyerId") ;
        //   console.log("----------- NOTIFICATION DATA -----------" , data);
        //   let UserData = data.buyer ? data.buyer : data.shippingDetails;
        //   console.log("----------- USER DATA -----------" , UserData);
        //   Notification.to.map((id) => {
        //     socket.to(String(id)).emit("notification", { message: `${UserData?.firstName} make a payment for Book ` })
        //     // io.to(id).emit("notification", { message: `${UserData?.firstName} make a payment for Book ` });
        //   })
        // } else {
        //   let data = await MeetingModel.findById(Notification.source)
        //   Notification.to.map((id) => {
        //     socket.to(String(id)).emit("notification", { message: `${data?.firstName} make a payment for Meeting ` })
        //     // io.to(id).emit("notification", { message: `${data?.firstName} make a payment for Meeting ` });
        //   })
        // }
      } else {
        console.log("-------- NO Notification Found ---------");
      }
    } catch (err) {
      console.log("-------> Notification Send Failed");
      console.log("   -------     ERROR -----> ", err);
    }

    // socket.to("64f8ded8db4d5d4cbece0fdd").emit("notification", { message: "Notification Received" })

    if (typeof callback === "function") callback({
      status: socket.id,
    });
  });

  socket.on("disconnect", async () => {
    removeOnlineUser(socket.id)
    console.log("----- IO-END ------ ", socket.id);
    //   await removeUser(socket.id);
  });
};




const addOnlineUser = async (id, socket) => {
  const user = await userModel.findById(id);
  if (user) {
    const onlineUser = await OnlineUsersModel.findOne({ userId: id })
    if (onlineUser) {
      await OnlineUsersModel.findOneAndUpdate({ userId: id }, { userId: id, socketId: socket });
    } else {
      await OnlineUsersModel.create({ userId: id, socketId: socket });
    }
  }
};

const removeOnlineUser = async (id) => {
  await OnlineUsersModel.findOneAndDelete({ socketId: id });
};


module.exports = { onConnection };