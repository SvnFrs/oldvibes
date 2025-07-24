
Old Vibes is a TikTok-inspired platform for sharing and discovering secondhand items. Users can post photos and videos of items they want to sell in a reel/story format with 24-hour expiration, creating a dynamic community around buying and selling used goods.

## Features

- **24-Hour Vibes**: Share photos/videos of items that automatically archive after 24 hours
- **Staff Moderation**: All posts are reviewed by staff before going live
- **Real-time Chat**: Socket.io-powered messaging between buyers and sellers
- **Social Features**: Like, comment, follow, and share vibes
- **Email Verification**: Required for posting and interactions
- **File Uploads**: AWS S3 integration for media storage
- **Search & Discovery**: Find items by category, condition, price, and location
- **Trending Algorithm**: Discover popular items based on likes and views

## Tech Stack

- **Backend**: Node.js with Bun runtime, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis for sessions and verification tokens
- **Real-time**: Socket.io for chat and live features
- **Storage**: AWS S3 for media files
- **Email**: Nodemailer for verification and notifications
- **Documentation**: Swagger/OpenAPI 3.0

## Prerequisites

- [Bun](https://bun.sh) v1.2.13+
- MongoDB database
- Redis server
- AWS S3 bucket
- SMTP email service

## Quick Start

### 1. Environment Setup

Copy the environment file and configure your settings:

```bash
cp .env.example .env
```

Required environment variables:

```bash
# Database
MONGO_URI=mongodb://localhost:27017
DB_NAME=oldvibes

# Server
PORT=4000
NODE_ENV=development

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
SESSION_SECRET=your-session-secret-key-here

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# AWS S3 Storage
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_KEY
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET_NAME=your-bucket-name

# File Upload Limits
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,video/mp4
UPLOAD_PATH=/uploads

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_NAME=Old Vibes
FROM_EMAIL=noreply@oldvibes.com

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000
```

### 2. Installation

```bash
bun install
```

### 3. Start Development Server

```bash
bun run dev
```

The server will start on `http://localhost:4000`

### 4. Access API Documentation

Visit `http://localhost:4000/api-docs` for interactive Swagger documentation.

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "username": "johndoe"
}
```

**Response:**
```json
{
  "message": "User registered successfully. Please check your email for verification.",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "username": "johndoe",
    "role": "user",
    "isEmailVerified": false
  },
  "emailSent": true
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Verify Email
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "verification_token_from_email"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer jwt_token_here
# OR use HTTP-only cookies
```

### Vibe (Item) Endpoints

#### Create New Vibe
```http
POST /api/vibes
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "itemName": "Vintage Camera",
  "description": "Great condition film camera from the 80s",
  "price": 150.00,
  "category": "Electronics",
  "condition": "good",
  "tags": ["vintage", "camera", "photography"],
  "location": "New York, NY"
}
```

**Response:**
```json
{
  "message": "Vibe created and submitted for review",
  "vibe": {
    "id": "vibe_id",
    "status": "pending",
    "expiresAt": "2024-01-15T12:00:00.000Z"
  }
}
```

#### Get All Approved Vibes
```http
GET /api/vibes?category=Electronics&condition=good&minPrice=50&maxPrice=200
```

#### Search Vibes
```http
GET /api/vibes/search?q=vintage camera&category=Electronics
```

#### Get Trending Vibes
```http
GET /api/vibes/trending
```

#### Upload Media for Vibe
```http
POST /api/vibes/{vibeId}/media
Authorization: Bearer jwt_token_here
Content-Type: multipart/form-data

media: [file1.jpg, file2.mp4] (max 5 files, 10MB each)
```

#### Like/Unlike Vibe
```http
POST /api/vibes/{vibeId}/like
DELETE /api/vibes/{vibeId}/like
Authorization: Bearer jwt_token_here
```

#### Mark Vibe as Sold
```http
PATCH /api/vibes/{vibeId}/sold
Authorization: Bearer jwt_token_here
```

### User Profile Endpoints

#### Get User Profile
```http
GET /api/users/{username}
```

#### Update Own Profile
```http
PATCH /api/users/me
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "name": "John Smith",
  "bio": "Vintage enthusiast and collector"
}
```

#### Upload Profile Picture
```http
POST /api/users/me/avatar
Authorization: Bearer jwt_token_here
Content-Type: multipart/form-data

avatar: profile_image.jpg
```

#### Follow/Unfollow User
```http
POST /api/users/{targetUserId}/follow
DELETE /api/users/{targetUserId}/follow
Authorization: Bearer jwt_token_here
```

#### Search Users
```http
GET /api/users/search?q=john
```

### Comments Endpoints

#### Add Comment to Vibe
```http
POST /api/vibes/{vibeId}/comments
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "content": "Great item! Is it still available?",
  "parentCommentId": "optional_for_replies"
}
```

#### Get Vibe Comments
```http
GET /api/vibes/{vibeId}/comments?limit=20&offset=0&sortBy=newest
```

#### Get Comment Replies
```http
GET /api/comments/{commentId}/replies?limit=10&offset=0
```

#### Like/Unlike Comment
```http
POST /api/comments/{commentId}/like
DELETE /api/comments/{commentId}/like
Authorization: Bearer jwt_token_here
```

### Chat Endpoints

#### Start Conversation about Vibe
```http
POST /api/chat/vibes/{vibeId}/start
Authorization: Bearer jwt_token_here
```

#### Get User Conversations
```http
GET /api/chat/conversations?limit=20&offset=0
Authorization: Bearer jwt_token_here
```

#### Get Conversation Messages
```http
GET /api/chat/conversations/{conversationId}/messages?limit=50&offset=0
Authorization: Bearer jwt_token_here
```

#### Send Message (REST fallback)
```http
POST /api/chat/conversations/{conversationId}/messages
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "content": "Hi! Is this item still available?",
  "messageType": "text"
}
```

### Moderation Endpoints (Staff/Admin Only)

#### Get Pending Vibes
```http
GET /api/vibes/pending
Authorization: Bearer staff_or_admin_token
```

#### Moderate Vibe
```http
PATCH /api/vibes/{vibeId}/moderate
Authorization: Bearer staff_or_admin_token
Content-Type: application/json

{
  "action": "approve",
  "notes": "Looks good!"
}
```

### Share Endpoints

#### Get Vibe Share URLs
```http
GET /api/vibes/{vibeId}/share
```

**Response:**
```json
{
  "shareUrl": "https://oldvibes.com/vibes/vibe_id",
  "shareText": "Check out this amazing Vintage Camera for $150 on Old Vibes! 🌊",
  "socialLinks": {
    "twitter": "https://twitter.com/intent/tweet?text=...",
    "facebook": "https://www.facebook.com/sharer/sharer.php?u=...",
    "whatsapp": "https://wa.me/?text=...",
    "telegram": "https://t.me/share/url?url=..."
  }
}
```

## Socket.io Real-time Features

### Connection
Connect to the Socket.io server with authentication:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000', {
  auth: {
    token: 'your_jwt_token_here'
  }
});
```

### Chat Events

#### Join Conversation
```javascript
socket.emit('joinConversation', conversationId);
```

#### Send Message
```javascript
socket.emit('sendMessage', {
  conversationId: 'conv_id',
  content: 'Hello!',
  messageType: 'text'
});
```

#### Listen for New Messages
```javascript
socket.on('newMessage', (message) => {
  console.log('New message:', message);
});
```

#### Typing Indicators
```javascript
// Start typing
socket.emit('startTyping', conversationId);

// Stop typing
socket.emit('stopTyping', conversationId);

// Listen for typing events
socket.on('typingStart', ({ userId, conversationId }) => {
  // Show typing indicator
});

socket.on('typingStop', ({ userId, conversationId }) => {
  // Hide typing indicator
});
```

#### Mark Messages as Read
```javascript
socket.emit('markAsRead', {
  messageId: 'message_id',
  conversationId: 'conv_id'
});
```

#### Offer Management
```javascript
// Send offer
socket.emit('sendMessage', {
  conversationId: 'conv_id',
  content: 'Would you accept $120?',
  messageType: 'offer',
  offerData: {
    amount: 120,
    message: 'Would you accept $120?'
  }
});

// Update offer status
socket.emit('updateOfferStatus', {
  messageId: 'offer_message_id',
  status: 'accepted' // or 'rejected'
});

// Listen for offer updates
socket.on('offerStatusUpdate', ({ messageId, status, conversationId }) => {
  console.log(`Offer ${messageId} was ${status}`);
});
```

### Online Status Events
```javascript
// User comes online
socket.on('userOnline', ({ userId, username }) => {
  console.log(`${username} is now online`);
});

// User goes offline
socket.on('userOffline', ({ userId }) => {
  console.log(`User ${userId} went offline`);
});
```

## Data Models

### User
```typescript
interface User {
  email: string;
  password: string; // hashed
  name: string;
  username: string; // unique
  role: "admin" | "staff" | "user" | "guest";
  profilePicture?: string;
  bio?: string; // max 150 chars
  followers: ObjectId[];
  following: ObjectId[];
  isVerified: boolean; // verified account badge
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Vibe (Item)
```typescript
interface Vibe {
  userId: ObjectId;
  itemName: string;
  description: string; // max 500 chars
  price: number;
  tags: string[];
  mediaFiles: {
    type: "image" | "video";
    url: string;
    thumbnail?: string;
  }[];
  status: "pending" | "approved" | "rejected" | "sold" | "archived";
  moderationNotes?: string;
  moderatedBy?: ObjectId;
  category: string;
  condition: "new" | "like-new" | "good" | "fair" | "poor";
  location?: string;
  likes: ObjectId[];
  commentsCount: number;
  views: number;
  expiresAt: Date; // 24 hours from creation
  createdAt: Date;
  updatedAt: Date;
}
```

### Comment
```typescript
interface Comment {
  vibeId: ObjectId;
  userId: ObjectId;
  content: string; // max 500 chars
  parentComment?: ObjectId; // for replies
  isActive: boolean;
  likesCount: number;
  repliesCount: number;
  likes: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Conversation
```typescript
interface Conversation {
  conversationId: string; // unique hash
  vibeId: ObjectId;
  sellerId: ObjectId;
  buyerId: ObjectId;
  lastMessage?: {
    content: string;
    senderId: ObjectId;
    timestamp: Date;
    messageType: string;
  };
  unreadCount: {
    seller: number;
    buyer: number;
  };
  isActive: boolean;
  isBlocked: boolean;
  blockedBy?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

### Message
```typescript
interface Message {
  conversationId: string;
  senderId: ObjectId;
  receiverId: ObjectId;
  vibeId: ObjectId;
  content: string; // max 1000 chars
  messageType: "text" | "image" | "offer" | "system";
  attachments?: {
    type: "image" | "file";
    url: string;
    filename: string;
    size: number;
  }[];
  offerData?: {
    amount: number;
    message?: string;
    status: "pending" | "accepted" | "rejected" | "expired";
    expiresAt: Date;
  };
  isRead: boolean;
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Authentication & Authorization

### JWT Authentication
The API uses JWT tokens for authentication. Tokens can be provided in two ways:

1. **Authorization Header**: `Authorization: Bearer <token>`
2. **HTTP-only Cookie**: Automatically set on login

### User Roles
- **user**: Regular users (default)
- **staff**: Can moderate vibes
- **admin**: Full access
- **guest**: Limited access

### Email Verification
Email verification is required for:
- Posting vibes
- Liking items
- Commenting
- Following users
- Starting conversations

## Error Handling

### Standard Error Response
```json
{
  "message": "Error description",
  "error": "Detailed error (development only)",
  "code": "ERROR_CODE"
}
```

### Common Error Codes
- `EMAIL_NOT_VERIFIED`: Action requires email verification
- `UNAUTHORIZED_CONVERSATION`: Can't access conversation
- `VIBE_NOT_FOUND`: Vibe doesn't exist or expired
- `FILE_TOO_LARGE`: Uploaded file exceeds size limit
- `INVALID_FILE_TYPE`: Unsupported file format

## Rate Limiting

The API implements rate limiting:
- **15 minutes window**
- **100 requests per IP**
- **Applies to all endpoints**

## File Upload Specifications

### Profile Pictures
- **Max size**: 5MB
- **Formats**: JPEG, PNG
- **Storage**: AWS S3

### Vibe Media
- **Max size**: 10MB per file
- **Max files**: 5 per vibe
- **Formats**: JPEG, PNG, MP4
- **Storage**: AWS S3

## Automatic Cleanup

### Vibe Expiration
- Vibes automatically expire after 24 hours
- Expired vibes are moved to "archived" status
- Cleanup runs hourly via cron job

### Database Indexing
Optimized indexes for:
- Vibe expiration and status
- User searches
- Comment hierarchies
- Conversation participants

## Development

### Project Structure
```
server/
├── config/          # Configuration files
├── controllers/     # Route handlers
├── middleware/      # Express middleware
├── models/          # Database models
├── routes/          # API routes
├── schema/          # MongoDB schemas
├── services/        # Business logic
├── types/           # TypeScript types
├── utils/           # Utility functions
└── job/             # Cron jobs
```

### Scripts
```bash
# Development with hot reload
bun run dev

# Production start
bun start

# Type checking
bun run type-check
```

### Adding New Features
1. Define types in `/types`
2. Create schema in `/schema`
3. Implement model in `/models`
4. Add service logic in `/services`
5. Create controller in `/controllers`
6. Define routes in `/routes`
7. Add middleware if needed
8. Update Swagger documentation

## Production Deployment

### Environment Variables
Set production values for:
- `NODE_ENV=production`
- Database connection strings
- AWS credentials
- SMTP configuration
- JWT secrets

### Security Considerations
- Use strong JWT secrets
- Enable HTTPS
- Configure CORS properly
- Set secure cookie options
- Use environment-specific SMTP
- Implement proper logging

### Monitoring
The API provides health check at:
```http
GET /health
```

Response includes:
- Server status
- Connected WebSocket users
- Database connection status

## Support

For questions or issues:
1. Check the Swagger documentation at `/api-docs`
2. Review this README
3. Check server logs for errors
4. Verify environment configuration

---
**Old Vibes** - Where secondhand becomes trending! 🌊
