"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const API_BASE = "http://localhost:4000/api";

interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  role: string;
  isEmailVerified?: boolean;
}

interface Vibe {
  id: string;
  itemName: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  status: string;
  user: {
    username: string;
    name: string;
  };
  likesCount: number;
  views: number;
  tags: string[];
  createdAt: string;
}

interface Comment {
  id: string;
  content: string;
  user: {
    username: string;
    name: string;
  };
  likesCount: number;
  repliesCount: number;
  createdAt: string;
}

interface Message {
  id: string;
  content: string;
  sender: {
    username: string;
    name: string;
  };
  messageType: string;
  createdAt: string;
}

interface Conversation {
  conversationId: string;
  vibe: {
    itemName: string;
    price: number;
  };
  participant: {
    username: string;
    name: string;
  };
  unreadCount: number;
  lastMessage?: {
    content: string;
    timestamp: string;
    isFromMe: boolean;
  };
}

export default function TestPage() {
  // Auth State
  const [token, setToken] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Form States
  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    name: "",
    username: "",
  });

  // Vibe States
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [vibeForm, setVibeForm] = useState({
    itemName: "",
    description: "",
    price: "",
    category: "",
    condition: "good",
    tags: "",
  });

  // Comment States
  const [selectedVibeId, setSelectedVibeId] = useState<string>("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentContent, setCommentContent] = useState("");

  // Chat States
  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageContent, setMessageContent] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // Profile States
  const [profileForm, setProfileForm] = useState({
    name: "",
    bio: "",
  });

  // Status
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Utility function for API calls
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_BASE}${endpoint}`;
    const defaultHeaders: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "API call failed");
    }
    return data;
  };

  // Auth Functions
  const register = async () => {
    try {
      const data = await apiCall("/auth/register", {
        method: "POST",
        body: JSON.stringify(authForm),
      });
      setToken(data.token);
      setUser(data.user);
      setIsLoggedIn(true);
      setStatus(
        "Registered successfully! Please check your email for verification.",
      );
      setupSocket(data.token);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const login = async () => {
    try {
      const data = await apiCall("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: authForm.email,
          password: authForm.password,
        }),
      });
      setToken(data.token);
      setUser(data.user);
      setIsLoggedIn(true);
      setStatus("Logged in successfully!");
      setupSocket(data.token);
      await loadVibes();
      await loadConversations();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const logout = async () => {
    try {
      await apiCall("/auth/logout", { method: "POST" });
      setToken("");
      setUser(null);
      setIsLoggedIn(false);
      setStatus("Logged out successfully!");
      socket?.disconnect();
      setSocket(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Socket Setup
  const setupSocket = (authToken: string) => {
    const newSocket = io("http://localhost:4000", {
      auth: { token: authToken },
    });

    newSocket.on("connect", () => {
      console.log("Connected to chat server");
      setStatus("Connected to real-time chat");
    });

    newSocket.on("newMessage", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on("userOnline", (data: { userId: string; username: string }) => {
      setOnlineUsers((prev) => [...prev, data.username]);
      setStatus(`${data.username} is now online`);
    });

    newSocket.on("userOffline", (data: { userId: string }) => {
      setOnlineUsers((prev) =>
        prev.filter((username) => username !== data.userId),
      );
    });

    newSocket.on("error", (error: { message: string }) => {
      setError(`Chat error: ${error.message}`);
    });

    setSocket(newSocket);
  };

  // Profile Functions
  const updateProfile = async () => {
    try {
      const data = await apiCall("/users/me", {
        method: "PATCH",
        body: JSON.stringify(profileForm),
      });
      setUser({ ...user!, ...data.profile });
      setStatus("Profile updated successfully!");
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Vibe Functions
  const createVibe = async () => {
    try {
      const vibeData = {
        ...vibeForm,
        price: parseFloat(vibeForm.price),
        tags: vibeForm.tags.split(",").map((tag) => tag.trim()),
      };
      await apiCall("/vibes", {
        method: "POST",
        body: JSON.stringify(vibeData),
      });
      setStatus("Vibe created successfully! Pending review.");
      setVibeForm({
        itemName: "",
        description: "",
        price: "",
        category: "",
        condition: "good",
        tags: "",
      });
      await loadVibes();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadVibes = async () => {
    try {
      const data = await apiCall("/vibes");
      setVibes(data.vibes);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const likeVibe = async (vibeId: string) => {
    try {
      await apiCall(`/vibes/${vibeId}/like`, { method: "POST" });
      setStatus("Vibe liked!");
      await loadVibes();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const shareVibe = async (vibeId: string) => {
    try {
      const data = await apiCall(`/vibes/${vibeId}/share`);
      navigator.clipboard.writeText(data.shareUrl);
      setStatus("Share URL copied to clipboard!");
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Comment Functions
  const loadComments = async (vibeId: string) => {
    try {
      const data = await apiCall(`/vibes/${vibeId}/comments`);
      setComments(data.comments);
      setSelectedVibeId(vibeId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const createComment = async () => {
    if (!selectedVibeId || !commentContent.trim()) return;
    try {
      await apiCall(`/vibes/${selectedVibeId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: commentContent }),
      });
      setCommentContent("");
      setStatus("Comment added!");
      await loadComments(selectedVibeId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Chat Functions
  const loadConversations = async () => {
    try {
      const data = await apiCall("/chat/conversations");
      setConversations(data.conversations);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startConversation = async (vibeId: string) => {
    try {
      const data = await apiCall(`/chat/vibes/${vibeId}/start`, {
        method: "POST",
      });
      setStatus(`Started conversation about ${data.vibe.itemName}`);
      await loadConversations();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const data = await apiCall(
        `/chat/conversations/${conversationId}/messages`,
      );
      setMessages(data.messages);
      setSelectedConversation(conversationId);
      socket?.emit("joinConversation", conversationId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const sendMessage = () => {
    if (!selectedConversation || !messageContent.trim() || !socket) return;

    socket.emit("sendMessage", {
      conversationId: selectedConversation,
      content: messageContent,
      messageType: "text",
    });
    setMessageContent("");
  };

  const clearStatus = () => {
    setStatus("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Old Vibes - Test Interface 🌊
        </h1>

        {/* Status Messages */}
        {(status || error) && (
          <div className="mb-6">
            {status && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-2">
                {status}
                <button
                  onClick={clearStatus}
                  className="float-right text-green-700 hover:text-green-900"
                >
                  ×
                </button>
              </div>
            )}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-2">
                {error}
                <button
                  onClick={clearStatus}
                  className="float-right text-red-700 hover:text-red-900"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        )}

        {/* Authentication Section */}
        {!isLoggedIn ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Authentication</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="email"
                placeholder="Email"
                value={authForm.email}
                onChange={(e) =>
                  setAuthForm({ ...authForm, email: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="password"
                placeholder="Password"
                value={authForm.password}
                onChange={(e) =>
                  setAuthForm({ ...authForm, password: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Full Name (for registration)"
                value={authForm.name}
                onChange={(e) =>
                  setAuthForm({ ...authForm, name: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Username (for registration)"
                value={authForm.username}
                onChange={(e) =>
                  setAuthForm({ ...authForm, username: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-4 mt-4">
              <button
                onClick={register}
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Register
              </button>
              <button
                onClick={login}
                className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                Login
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* User Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Welcome, {user?.name}! ({user?.username})
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Email Verified: {user?.isEmailVerified ? "✅ Yes" : "❌ No"}
                </p>

                {/* Profile Update */}
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Update name"
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, name: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Update bio"
                    value={profileForm.bio}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, bio: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={updateProfile}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    >
                      Update Profile
                    </button>
                    <button
                      onClick={logout}
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>

              {/* Create Vibe */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Create Vibe</h2>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Item Name"
                    value={vibeForm.itemName}
                    onChange={(e) =>
                      setVibeForm({ ...vibeForm, itemName: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  <textarea
                    placeholder="Description"
                    value={vibeForm.description}
                    onChange={(e) =>
                      setVibeForm({ ...vibeForm, description: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md h-20"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Price"
                      value={vibeForm.price}
                      onChange={(e) =>
                        setVibeForm({ ...vibeForm, price: e.target.value })
                      }
                      className="p-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      placeholder="Category"
                      value={vibeForm.category}
                      onChange={(e) =>
                        setVibeForm({ ...vibeForm, category: e.target.value })
                      }
                      className="p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <select
                    value={vibeForm.condition}
                    onChange={(e) =>
                      setVibeForm({ ...vibeForm, condition: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="new">New</option>
                    <option value="like-new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Tags (comma separated)"
                    value={vibeForm.tags}
                    onChange={(e) =>
                      setVibeForm({ ...vibeForm, tags: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  <button
                    onClick={createVibe}
                    className="w-full bg-purple-500 text-white py-2 rounded-md hover:bg-purple-600"
                  >
                    Create Vibe
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              {selectedVibeId && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Comments</h2>
                  <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-gray-50 p-3 rounded-md"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">
                              @{comment.user.username}
                            </p>
                            <p className="text-gray-700">{comment.content}</p>
                          </div>
                          <div className="text-xs text-gray-500">
                            ❤️ {comment.likesCount} | 💬 {comment.repliesCount}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded-md"
                      onKeyPress={(e) => e.key === "Enter" && createComment()}
                    />
                    <button
                      onClick={createComment}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Vibes List */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Vibes</h2>
                  <button
                    onClick={loadVibes}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                  >
                    Refresh
                  </button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {vibes.map((vibe) => (
                    <div
                      key={vibe.id}
                      className="border border-gray-200 p-4 rounded-md"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{vibe.itemName}</h3>
                          <p className="text-sm text-gray-600">
                            by @{vibe.user.username}
                          </p>
                          <p className="text-lg font-bold text-green-600">
                            ${vibe.price}
                          </p>
                        </div>
                        <div className="text-sm text-gray-500">
                          <div className="bg-gray-100 px-2 py-1 rounded text-xs mb-1">
                            {vibe.status}
                          </div>
                          ❤️ {vibe.likesCount} | 👀 {vibe.views}
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm mb-3">
                        {vibe.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {vibe.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => likeVibe(vibe.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                        >
                          ❤️ Like
                        </button>
                        <button
                          onClick={() => loadComments(vibe.id)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          💬 Comments
                        </button>
                        <button
                          onClick={() => shareVibe(vibe.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                        >
                          📤 Share
                        </button>
                        <button
                          onClick={() => startConversation(vibe.id)}
                          className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600"
                        >
                          💭 Chat
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Chat</h2>
                  <div className="text-sm text-gray-500">
                    Online: {onlineUsers.length} users
                  </div>
                </div>

                {/* Conversations */}
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Conversations</h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {conversations.map((conv) => (
                      <div
                        key={conv.conversationId}
                        onClick={() => loadMessages(conv.conversationId)}
                        className={`p-2 border rounded cursor-pointer hover:bg-gray-50 ${
                          selectedConversation === conv.conversationId
                            ? "bg-blue-50 border-blue-300"
                            : ""
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">
                              {conv.vibe.itemName}
                            </p>
                            <p className="text-xs text-gray-600">
                              with @{conv.participant.username}
                            </p>
                            {conv.lastMessage && (
                              <p className="text-xs text-gray-500 truncate">
                                {conv.lastMessage.isFromMe ? "You: " : ""}
                                {conv.lastMessage.content}
                              </p>
                            )}
                          </div>
                          {conv.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Messages */}
                {selectedConversation && (
                  <div>
                    <h3 className="font-medium mb-2">Messages</h3>
                    <div className="border rounded-md p-3 h-60 overflow-y-auto mb-3 bg-gray-50">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`mb-2 p-2 rounded max-w-xs ${
                            message.sender.username === user?.username
                              ? "bg-blue-500 text-white ml-auto"
                              : "bg-white"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-75">
                            {message.sender.username === user?.username
                              ? "You"
                              : message.sender.username}
                          </p>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded-md"
                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      />
                      <button
                        onClick={sendMessage}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
