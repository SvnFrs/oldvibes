export interface CreateMessageInput {
  content: string;
  messageType?: "text" | "image" | "offer";
  offerData?: {
    amount: number;
    message?: string;
  };
}

export interface MessageResponse {
  id: string;
  conversationId: string;
  content: string;
  messageType: string;
  sender: {
    id: string;
    username: string;
    name: string;
    profilePicture?: string;
  };
  receiver: {
    id: string;
    username: string;
    name: string;
    profilePicture?: string;
  };
  attachments?: Array<{
    type: string;
    url: string;
    filename: string;
    size: number;
  }>;
  offerData?: {
    amount: number;
    message?: string;
    status: string;
    expiresAt: Date;
  };
  isRead: boolean;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationResponse {
  id: string;
  conversationId: string;
  vibe: {
    id: string;
    itemName: string;
    price: number;
    status: string;
    mediaFiles: Array<{
      type: string;
      url: string;
    }>;
  };
  participant: {
    id: string;
    username: string;
    name: string;
    profilePicture?: string;
    isVerified: boolean;
  };
  lastMessage?: {
    content: string;
    timestamp: Date;
    messageType: string;
    isFromMe: boolean;
  };
  unreadCount: number;
  isActive: boolean;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SocketUser {
  userId: string;
  username: string;
  socketId: string;
}

// Socket.io event types
export interface ServerToClientEvents {
  newMessage: (message: MessageResponse) => void;
  messageRead: (data: { messageId: string; conversationId: string }) => void;
  messageEdited: (message: MessageResponse) => void;
  messageDeleted: (data: { messageId: string; conversationId: string }) => void;
  userOnline: (data: { userId: string; username: string }) => void;
  userOffline: (data: { userId: string }) => void;
  typingStart: (data: { userId: string; conversationId: string }) => void;
  typingStop: (data: { userId: string; conversationId: string }) => void;
  offerStatusUpdate: (data: {
    messageId: string;
    status: string;
    conversationId: string;
  }) => void;
  error: (error: { message: string; code?: string }) => void;
}

export interface ClientToServerEvents {
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendMessage: (data: CreateMessageInput & { conversationId: string }) => void;
  markAsRead: (data: { messageId: string; conversationId: string }) => void;
  editMessage: (data: { messageId: string; content: string }) => void;
  deleteMessage: (data: { messageId: string }) => void;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  updateOfferStatus: (data: {
    messageId: string;
    status: "accepted" | "rejected";
  }) => void;
}
