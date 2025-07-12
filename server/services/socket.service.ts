import { Server as SocketServer } from "socket.io";
import type { Server as HttpServer } from "http";
import { verifyToken } from "../utils/jwt.utils";
import { ChatService } from "./chat.services";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  SocketUser,
  CreateMessageInput,
} from "../types/chat.types";

export class SocketService {
  private io: SocketServer<ClientToServerEvents, ServerToClientEvents>;
  private chatService = new ChatService();
  private connectedUsers = new Map<string, SocketUser>(); // userId -> SocketUser
  private userSockets = new Map<string, string>(); // socketId -> userId

  constructor(server: HttpServer) {
    this.io = new SocketServer(server, {
      cors: {
        origin:
          process.env.NODE_ENV === "production"
            ? ["your-production-domain.com"]
            : ["http://localhost:3000", "http://localhost:5173"],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token =
          socket.handshake.auth.token || socket.handshake.query.token;

        if (!token) {
          return next(new Error("Authentication token required"));
        }

        const decoded = verifyToken(token as string);
        socket.data.user = decoded;
        next();
      } catch (error) {
        next(new Error("Invalid authentication token"));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on("connection", (socket) => {
      const user = socket.data.user;
      console.log(`User ${user.username} connected with socket ${socket.id}`);

      // Store user connection
      this.connectedUsers.set(user.userId, {
        userId: user.userId,
        username: user.username,
        socketId: socket.id,
      });
      this.userSockets.set(socket.id, user.userId);

      // Notify others that user is online
      socket.broadcast.emit("userOnline", {
        userId: user.userId,
        username: user.username,
      });

      // Join conversation rooms
      socket.on("joinConversation", async (conversationId: string) => {
        try {
          const hasAccess = await this.chatService.validateConversationAccess(
            conversationId,
            user.userId,
          );

          if (hasAccess) {
            socket.join(`conversation:${conversationId}`);
            console.log(
              `User ${user.username} joined conversation ${conversationId}`,
            );
          } else {
            socket.emit("error", {
              message: "Unauthorized to join this conversation",
              code: "UNAUTHORIZED_CONVERSATION",
            });
          }
        } catch (error) {
          socket.emit("error", {
            message: "Error joining conversation",
            code: "JOIN_CONVERSATION_ERROR",
          });
        }
      });

      // Leave conversation room
      socket.on("leaveConversation", (conversationId: string) => {
        socket.leave(`conversation:${conversationId}`);
        console.log(
          `User ${user.username} left conversation ${conversationId}`,
        );
      });

      // Send message
      socket.on(
        "sendMessage",
        async (data: CreateMessageInput & { conversationId: string }) => {
          try {
            const { conversationId, ...messageData } = data;

            // Validate conversation access
            const hasAccess = await this.chatService.validateConversationAccess(
              conversationId,
              user.userId,
            );

            if (!hasAccess) {
              socket.emit("error", {
                message: "Unauthorized to send message in this conversation",
                code: "UNAUTHORIZED_MESSAGE",
              });
              return;
            }

            // Send message
            const message = await this.chatService.sendMessage(
              conversationId,
              user.userId,
              messageData,
            );

            // Emit to conversation room
            this.io
              .to(`conversation:${conversationId}`)
              .emit("newMessage", message);

            console.log(
              `Message sent in conversation ${conversationId} by ${user.username}`,
            );
          } catch (error) {
            socket.emit("error", {
              message: "Error sending message",
              code: "SEND_MESSAGE_ERROR",
            });
            console.error("Send message error:", error);
          }
        },
      );

      // Mark message as read
      socket.on(
        "markAsRead",
        async (data: { messageId: string; conversationId: string }) => {
          try {
            await this.chatService.markMessageAsRead(
              data.messageId,
              user.userId,
            );

            // Notify conversation participants
            socket
              .to(`conversation:${data.conversationId}`)
              .emit("messageRead", {
                messageId: data.messageId,
                conversationId: data.conversationId,
              });
          } catch (error) {
            socket.emit("error", {
              message: "Error marking message as read",
              code: "MARK_READ_ERROR",
            });
          }
        },
      );

      // Update offer status
      socket.on(
        "updateOfferStatus",
        async (data: {
          messageId: string;
          status: "accepted" | "rejected";
        }) => {
          try {
            const updatedMessage = await this.chatService.updateOfferStatus(
              data.messageId,
              data.status,
              user.userId,
            );

            // Notify conversation participants
            this.io
              .to(`conversation:${updatedMessage.conversationId}`)
              .emit("offerStatusUpdate", {
                messageId: data.messageId,
                status: data.status,
                conversationId: updatedMessage.conversationId,
              });
          } catch (error) {
            socket.emit("error", {
              message: "Error updating offer status",
              code: "OFFER_UPDATE_ERROR",
            });
          }
        },
      );

      // Typing indicators
      socket.on("startTyping", (conversationId: string) => {
        socket.to(`conversation:${conversationId}`).emit("typingStart", {
          userId: user.userId,
          conversationId,
        });
      });

      socket.on("stopTyping", (conversationId: string) => {
        socket.to(`conversation:${conversationId}`).emit("typingStop", {
          userId: user.userId,
          conversationId,
        });
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log(`User ${user.username} disconnected`);

        // Remove from connected users
        this.connectedUsers.delete(user.userId);
        this.userSockets.delete(socket.id);

        // Notify others that user is offline
        socket.broadcast.emit("userOffline", { userId: user.userId });
      });
    });
  }

  // Utility methods
  getConnectedUsers(): SocketUser[] {
    return Array.from(this.connectedUsers.values());
  }

  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  getUserSocket(userId: string): string | undefined {
    return this.connectedUsers.get(userId)?.socketId;
  }

  // Send notification to specific user
  sendNotificationToUser(userId: string, notification: any) {
    const user = this.connectedUsers.get(userId);
    if (user) {
      this.io.to(user.socketId).emit("error", notification);
    }
  }
}

let socketService: SocketService;

export const initializeSocket = (server: HttpServer): SocketService => {
  socketService = new SocketService(server);
  return socketService;
};

export const getSocketService = (): SocketService => {
  if (!socketService) {
    throw new Error("Socket service not initialized");
  }
  return socketService;
};
