import Message from '../models/Message.js';

const validateMessage = (message) => {
  if (!message || typeof message !== 'string') return 'Message is required!';
  if (message.trim().length === 0) return 'Message cannot be empty!';
  if (message.length > 1000) return 'Message too long! Max 1000 characters.';
  return null;
};

export const sendPrivateMessage = async (socket, io, onlineUsers, data) => {
  const { receiverId, message } = data;
  const { id: _id, role } = socket.user;
  const senderName = role === 'admin' ? 'Administrator' : socket.user.name || 'Employee';

  const error = validateMessage(message);
  if (error) return socket.emit('error', error);

  if (!receiverId) return socket.emit('error', 'Receiver not found!');
  if (receiverId === _id.toString()) return socket.emit('error', 'Cannot send message to yourself!');

  try {
    const newMessage = await Message.create({
      sender: role === 'admin' ? null : _id,
      receiver: receiverId === 'admin' ? null : receiverId,
      senderRole: role,
      message: message.trim(),
      type: 'private',
      isRead: false
    });

    const payload = {
      _id: newMessage._id,
      sender: { _id, name: senderName },
      message: message.trim(),
      isRead: false,
      createdAt: newMessage.createdAt
    };

    const receiverSocketId = onlineUsers[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit('private-message', payload);
    }

    socket.emit('message-sent', { ...payload, receiverId });

  } catch (err) {
    console.error('Send message error:', err.message);
    socket.emit('error', 'Failed to send message!');
  }
};

export const sendBroadcastMessage = async (socket, io, data) => {
  const { message } = data;
  const { id: _id, role } = socket.user;

  if (role !== 'admin') return socket.emit('error', 'Permission denied!');

  const error = validateMessage(message);
  if (error) return socket.emit('error', error);

  try {
    const newMessage = await Message.create({
      sender: null,
      senderRole: 'admin',
      receiver: null,
      message: message.trim(),
      type: 'broadcast',
      isRead: false
    });

    io.emit('broadcast-message', {
      _id: newMessage._id,
      sender: { _id, name: 'Administrator' },
      message: message.trim(),
      createdAt: newMessage.createdAt
    });

  } catch (err) {
    console.error('Broadcast error:', err.message);
    socket.emit('error', 'Failed to broadcast message!');
  }
};

export const markMessageRead = async (socket, io, onlineUsers, data) => {
  const { messageId } = data;

  if (!messageId) return socket.emit('error', 'Message ID is required!');

  try {
    const updated = await Message.findByIdAndUpdate(
      messageId,
      { isRead: true, readAt: new Date() },
      { returnDocument: 'after' }
    );

    if (!updated) return socket.emit('error', 'Message not found!');

    const adminSocketId = onlineUsers['admin'];

    if (adminSocketId) {
      io.to(adminSocketId).emit('message-read', {
        messageId: String(updated._id),
        readAt: updated.readAt
      });
    }

  } catch (err) {
    console.error('Mark read error:', err.message);
    socket.emit('error', 'Failed to update read status!');
  }
};

export const getChatHistory = async (socket, data) => {
  const { withUserId } = data;
  const { id: _id, role } = socket.user;

  if (!withUserId) return socket.emit('error', 'User ID is required!');

  try {
    let messages;

    if (role === 'admin') {
      messages = await Message.find({
        $or: [
          { type: 'private', sender: withUserId, receiver: null },
          { type: 'private', sender: null, receiver: withUserId },
          { type: 'broadcast', sender: null }
        ]
      }).sort({ createdAt: 1 });

    } else {
      messages = await Message.find({
        $or: [
          { type: 'private', sender: _id, receiver: null },
          { type: 'private', sender: null, receiver: _id },
          { type: 'broadcast' }
        ]
      }).sort({ createdAt: 1 });
    }

    socket.emit('chat-history', messages);

  } catch (err) {
    console.error('Get history error:', err.message);
    socket.emit('error', 'Failed to load chat history!');
  }
};