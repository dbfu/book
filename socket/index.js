var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var service = require("../service.js")

server.listen(3001);

io.on('connection', function (socket) {
  socket.on("join", async function (data) {
    socket.join(data.bookId);

    console.log(socket.id);

    var result = await service("message").columns("*").where({ bookId: data.bookId });

    socket.emit("getHistory", { messages: result });

    io.in(data.bookId).clients((error, clients) => {
      if (error) throw error;
      io.to(data.bookId).emit("count", { count: clients.length });
      // socket.emit("count", { count: clients.length });
    });


  })

  socket.on('close', function (data) {
    socket.disconnect(true);

    io.in(data.bookId).clients((error, clients) => {
      if (error) throw error;
      io.to(data.bookId).emit("count", { count: clients.length });
      // socket.emit("count", { count: clients.length });
    });
  });

  socket.on('message', async function (data) {

    socket.broadcast.emit("message", data);

    await service("message").insert({
      nickName: data.nickName,
      avatarUrl: data.avatarUrl,
      content: data.content,
      userId: data.userId,
      bookId: data.bookId,
    });

  });
});