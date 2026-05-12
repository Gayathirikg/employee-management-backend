import {
  sendPrivateMessage,
  sendBroadcastMessage,
  markMessageRead,
  getChatHistory
} from '../controllers/chatController.js';

const onlineUsers = {};

export const initChatSocket = (io) => {

  io.on('connection', (socket) => {
    const { id: _id, role } = socket.user; 

  console.log('Adding to online:', _id, socket.id); 

    console.log(`Connected: ${_id} (${role})`);

    onlineUsers[_id] = socket.id;

      console.log('Online users now:', onlineUsers); 

    io.emit('online-users', onlineUsers);

    socket.on('private-message', (data) => 
      sendPrivateMessage(socket, io, onlineUsers, data)
    );

    socket.on('broadcast-message', (data) => 
      sendBroadcastMessage(socket, io, data)
    );

    socket.on('message-read', (data) => 
      markMessageRead(socket, io, onlineUsers, data)
    );

    socket.on('get-history', (data) => 
      getChatHistory(socket, data)
    );

    socket.on('disconnect', () => {
      delete onlineUsers[_id];
      io.emit('online-users', onlineUsers);
    });
  });
};