# Old Vibes - Software Design Document & User Flows

## User Flow Examples

### 1. New User Registration & First Vibe Flow

```
1. User visits the platform
2. User clicks "Sign Up"
3. User fills registration form (email, password, name, username)
4. System creates account with isEmailVerified=false
5. System sends verification email
6. User receives email and clicks verification link
7. System verifies email and sets isEmailVerified=true
8. User gets welcome email
9. User logs in and sees dashboard
10. User clicks "Post Vibe"
11. User fills item details (name, description, price, category, condition)
12. User uploads photos/videos (max 5 files)
13. System creates vibe with status="pending"
14. Staff receives notification for moderation
15. Staff reviews and approves vibe
16. Vibe goes live for 24 hours
17. Other users can see, like, comment, and message about the item
18. After 24 hours, vibe automatically archives
```

### 2. Buyer Journey Flow

```
1. User browses trending vibes or searches for items
2. User finds interesting item
3. User views vibe details (increments view count)
4. User likes the vibe
5. User adds comment asking about availability
6. Seller responds to comment
7. User clicks "Message Seller"
8. System creates conversation between buyer and seller
9. Real-time chat begins via Socket.io
10. Buyer asks questions about the item
11. Buyer makes offer through chat
12. Seller accepts/rejects offer
13. If accepted, users exchange contact details
14. Seller marks item as "sold"
15. Vibe status changes to "sold"
```

### 3. Seller Journey Flow

```
1. Seller posts vibe (goes through moderation)
2. Vibe gets approved and goes live
3. Buyers start viewing, liking, commenting
4. Seller receives notifications for interactions
5. Buyer initiates conversation about item
6. Seller responds via real-time chat
7. Negotiation happens through chat system
8. Deal is agreed upon
9. Seller marks item as sold
10. Conversation can continue for logistics
11. After 24 hours, original vibe archives
12. Seller can post new vibes
```

### 4. Staff Moderation Flow

```
1. User submits new vibe
2. Vibe enters "pending" status
3. Staff member logs in with staff credentials
4. Staff accesses moderation dashboard
5. Staff reviews pending vibes (FIFO order)
6. Staff examines photos, description, pricing
7. Staff either:
   - Approves: Vibe goes live
   - Rejects: Vibe gets "rejected" status with notes
8. User receives notification of decision
9. If rejected, user can edit and resubmit
10. Process repeats until approved or user gives up
```

### 5. Social Features Flow

```
1. User discovers another user's profile
2. User clicks "Follow"
3. System updates follower/following counts
4. User can see followed users' vibes in feed
5. User can like and comment on vibes
6. User can share vibes to social media
7. User builds social network within platform
8. User receives notifications for social interactions
```

## PlantUML Diagrams for Software Design Document

### 1. System Architecture Diagram

```plantuml
@startuml System_Architecture
!define RECTANGLE class

package "Client Layer" {
  [Web App] as webapp
  [Mobile App] as mobile
}

package "API Gateway" {
  [Express.js Server] as express
  [Socket.io Server] as socketio
}

package "Middleware Layer" {
  [Authentication] as auth
  [Authorization] as authz
  [Rate Limiting] as ratelimit
  [File Upload] as upload
  [Validation] as validation
}

package "Business Logic" {
  [User Service] as userservice
  [Vibe Service] as vibeservice
  [Chat Service] as chatservice
  [Email Service] as emailservice
  [Verification Service] as verificationservice
}

package "Data Layer" {
  database "MongoDB" as mongodb {
    [Users Collection] as users
    [Vibes Collection] as vibes
    [Comments Collection] as comments
    [Messages Collection] as messages
    [Conversations Collection] as conversations
  }

  database "Redis" as redis {
    [Session Store] as sessions
    [Verification Tokens] as tokens
    [Cache] as cache
  }
}

package "External Services" {
  cloud "AWS S3" as s3
  cloud "SMTP Server" as smtp
}

package "Background Jobs" {
  [Cron Jobs] as cronjobs
  [Cleanup Service] as cleanup
}

webapp --> express
mobile --> express
webapp --> socketio
mobile --> socketio

express --> auth
express --> authz
express --> ratelimit
express --> upload
express --> validation

auth --> userservice
authz --> userservice
upload --> s3
validation --> vibeservice

userservice --> mongodb
vibeservice --> mongodb
chatservice --> mongodb
emailservice --> smtp
verificationservice --> redis

socketio --> chatservice
cronjobs --> cleanup
cleanup --> mongodb

@enduml
```

### 2. Database Entity Relationship Diagram

```plantuml
@startuml Database_ERD
!define TABLE class

entity "users" as users {
  * _id : ObjectId
  --
  * email : String
  * password : String (hashed)
  * name : String
  * username : String
  role : String (enum)
  profilePicture : String
  bio : String
  followers : ObjectId[]
  following : ObjectId[]
  isVerified : Boolean
  isEmailVerified : Boolean
  isActive : Boolean
  createdAt : Date
  updatedAt : Date
}

entity "vibes" as vibes {
  * _id : ObjectId
  --
  * userId : ObjectId
  * itemName : String
  * description : String
  * price : Number
  tags : String[]
  mediaFiles : Object[]
  * status : String (enum)
  moderationNotes : String
  moderatedBy : ObjectId
  * category : String
  * condition : String (enum)
  location : String
  likes : ObjectId[]
  commentsCount : Number
  views : Number
  * expiresAt : Date
  createdAt : Date
  updatedAt : Date
}

entity "comments" as comments {
  * _id : ObjectId
  --
  * vibeId : ObjectId
  * userId : ObjectId
  * content : String
  parentComment : ObjectId
  isActive : Boolean
  likesCount : Number
  repliesCount : Number
  likes : ObjectId[]
  createdAt : Date
  updatedAt : Date
}

entity "conversations" as conversations {
  * _id : ObjectId
  --
  * conversationId : String (unique)
  * vibeId : ObjectId
  * sellerId : ObjectId
  * buyerId : ObjectId
  lastMessage : Object
  unreadCount : Object
  isActive : Boolean
  isBlocked : Boolean
  blockedBy : ObjectId
  createdAt : Date
  updatedAt : Date
}

entity "messages" as messages {
  * _id : ObjectId
  --
  * conversationId : String
  * senderId : ObjectId
  * receiverId : ObjectId
  * vibeId : ObjectId
  * content : String
  * messageType : String (enum)
  attachments : Object[]
  offerData : Object
  isRead : Boolean
  isEdited : Boolean
  editedAt : Date
  isDeleted : Boolean
  deletedAt : Date
  createdAt : Date
  updatedAt : Date
}

users ||--o{ vibes : "posts"
users ||--o{ comments : "writes"
users ||--o{ conversations : "participates (seller)"
users ||--o{ conversations : "participates (buyer)"
users ||--o{ messages : "sends"
users ||--o{ messages : "receives"
vibes ||--o{ comments : "has"
vibes ||--o{ conversations : "about"
vibes ||--o{ messages : "discusses"
comments ||--o{ comments : "replies to"
conversations ||--o{ messages : "contains"

@enduml
```

### 3. User Authentication Flow

```plantuml
@startuml Auth_Flow
actor User
participant "Web App" as webapp
participant "API Server" as api
participant "Database" as db
participant "Redis" as redis
participant "Email Service" as email

User -> webapp: Register
webapp -> api: POST /api/auth/register
api -> db: Check if user exists
db -> api: User not found
api -> db: Create user (isEmailVerified=false)
db -> api: User created
api -> redis: Store verification token
redis -> api: Token stored
api -> email: Send verification email
email -> User: Verification email
api -> webapp: Success + JWT token
webapp -> User: Show "Check email" message

User -> email: Click verification link
email -> webapp: Redirect with token
webapp -> api: POST /api/auth/verify-email
api -> redis: Validate token
redis -> api: Token valid
api -> db: Set isEmailVerified=true
db -> api: User updated
api -> redis: Delete token
api -> email: Send welcome email
api -> webapp: Email verified
webapp -> User: Success message

User -> webapp: Login
webapp -> api: POST /api/auth/login
api -> db: Validate credentials
db -> api: Valid user
api -> webapp: JWT token + user data
webapp -> User: Dashboard

@enduml
```

### 4. Vibe Creation and Moderation Flow

```plantuml
@startuml Vibe_Moderation_Flow
actor User
actor Staff
participant "Web App" as webapp
participant "API Server" as api
participant "Database" as db
participant "AWS S3" as s3
participant "Notification" as notif

User -> webapp: Create new vibe
webapp -> api: POST /api/vibes (requires email verification)
api -> db: Create vibe (status=pending)
db -> api: Vibe created
api -> notif: Notify staff of pending vibe
api -> webapp: Vibe submitted for review

Staff -> webapp: Login to admin panel
webapp -> api: GET /api/vibes/pending
api -> db: Fetch pending vibes
db -> api: Pending vibes list
api -> webapp: Show pending vibes

Staff -> webapp: Review vibe
alt Approve
  Staff -> webapp: Approve vibe
  webapp -> api: PATCH /api/vibes/{id}/moderate {action: approve}
  api -> db: Update vibe (status=approved, expiresAt=+24h)
  db -> api: Vibe approved
  api -> notif: Notify user of approval
else Reject
  Staff -> webapp: Reject vibe with notes
  webapp -> api: PATCH /api/vibes/{id}/moderate {action: reject, notes}
  api -> db: Update vibe (status=rejected)
  db -> api: Vibe rejected
  api -> notif: Notify user of rejection
end

api -> webapp: Moderation complete

User -> webapp: Upload media
webapp -> api: POST /api/vibes/{id}/media
api -> s3: Upload files
s3 -> api: File URLs
api -> db: Update vibe with media URLs
db -> api: Vibe updated
api -> webapp: Media uploaded

@enduml
```

### 5. Real-time Chat System Flow

```plantuml
@startuml Chat_System_Flow
actor Buyer
actor Seller
participant "Web App (Buyer)" as buyerapp
participant "Web App (Seller)" as sellerapp
participant "Socket.io Server" as socketio
participant "Chat Service" as chatservice
participant "Database" as db

Buyer -> buyerapp: Click "Message Seller"
buyerapp -> socketio: Connect with JWT
socketio -> chatservice: Validate token
chatservice -> socketio: Token valid
socketio -> buyerapp: Connected

buyerapp -> socketio: Start conversation about vibe
socketio -> chatservice: Create/get conversation
chatservice -> db: Create conversation record
db -> chatservice: Conversation created
chatservice -> socketio: Conversation ID
socketio -> buyerapp: Join conversation room

Seller -> sellerapp: Open chat
sellerapp -> socketio: Connect with JWT
socketio -> sellerapp: Connected
sellerapp -> socketio: Join conversation
socketio -> sellerapp: Joined conversation room

Buyer -> buyerapp: Type message
buyerapp -> socketio: startTyping event
socketio -> sellerapp: Show typing indicator

Buyer -> buyerapp: Send message
buyerapp -> socketio: sendMessage event
socketio -> chatservice: Process message
chatservice -> db: Save message
db -> chatservice: Message saved
chatservice -> socketio: Message data
socketio -> sellerapp: newMessage event
socketio -> buyerapp: Message confirmation

alt Offer Flow
  Buyer -> buyerapp: Make offer
  buyerapp -> socketio: sendMessage (type=offer)
  socketio -> chatservice: Create offer message
  chatservice -> db: Save offer
  socketio -> sellerapp: New offer received

  Seller -> sellerapp: Accept/Reject offer
  sellerapp -> socketio: updateOfferStatus
  socketio -> chatservice: Update offer status
  chatservice -> db: Update offer
  socketio -> buyerapp: Offer status update
end

@enduml
```

### 6. File Upload System Flow

```plantuml
@startuml File_Upload_Flow
actor User
participant "Web App" as webapp
participant "API Server" as api
participant "Multer Middleware" as multer
participant "AWS S3" as s3
participant "Database" as db

User -> webapp: Select files for upload
webapp -> api: POST /api/vibes/{id}/media (multipart/form-data)
api -> multer: Process upload
multer -> multer: Validate file type
multer -> multer: Validate file size
multer -> s3: Stream upload to S3
s3 -> multer: Return file URLs
multer -> api: Upload complete with URLs

api -> db: Update vibe with media URLs
db -> api: Vibe updated
api -> webapp: Success response with URLs
webapp -> User: Show uploaded media

alt Error Handling
  multer -> multer: File too large
  multer -> api: Error response
  api -> webapp: File size error
  webapp -> User: Show error message
else
  multer -> multer: Invalid file type
  multer -> api: Error response
  api -> webapp: File type error
  webapp -> User: Show error message
end

@enduml
```

### 7. Auto-Expiry System Flow

```plantuml
@startuml Auto_Expiry_Flow
participant "Cron Job" as cron
participant "Cleanup Service" as cleanup
participant "Database" as db
participant "Notification Service" as notif

cron -> cleanup: Run hourly cleanup
cleanup -> db: Find vibes where expiresAt <= now AND status = 'approved'
db -> cleanup: Return expired vibes list

loop For each expired vibe
  cleanup -> db: Update status to 'archived'
  db -> cleanup: Vibe archived
  cleanup -> notif: Notify vibe owner (optional)
end

cleanup -> db: Get count of archived vibes
db -> cleanup: Return count
cleanup -> cron: Log: "Archived X vibes"

note right of db
  MongoDB TTL index automatically
  removes archived vibes after
  additional time period
end note

@enduml
```

### 8. Component Architecture Diagram

```plantuml
@startuml Component_Architecture
package "Frontend Layer" {
  component [React/Vue App] as frontend
  component [Socket.io Client] as socketclient
}

package "API Gateway Layer" {
  component [Express.js Router] as router
  component [Socket.io Server] as socketserver
  component [Swagger Documentation] as swagger
}

package "Middleware Layer" {
  component [Authentication Middleware] as authmw
  component [Authorization Middleware] as authzmw
  component [Rate Limiting] as ratelimitmw
  component [File Upload Middleware] as uploadmw
  component [Validation Middleware] as validationmw
  component [Error Handler] as errorhandler
}

package "Controller Layer" {
  component [Auth Controller] as authctrl
  component [User Controller] as userctrl
  component [Vibe Controller] as vibectrl
  component [Comment Controller] as commentctrl
  component [Chat Controller] as chatctrl
}

package "Service Layer" {
  component [User Service] as userservice
  component [Vibe Service] as vibeservice
  component [Chat Service] as chatservice
  component [Email Service] as emailservice
  component [Verification Service] as verificationservice
}

package "Model Layer" {
  component [User Model] as usermodel
  component [Vibe Model] as vibemodel
  component [Comment Model] as commentmodel
  component [Message Model] as messagemodel
}

package "Data Access Layer" {
  component [MongoDB Driver] as mongodb
  component [Redis Client] as redis
  component [AWS S3 Client] as s3client
}

frontend --> router
socketclient --> socketserver
router --> swagger

router --> authmw
router --> authzmw
router --> ratelimitmw
router --> uploadmw
router --> validationmw
router --> errorhandler

authmw --> authctrl
authzmw --> userctrl
uploadmw --> vibectrl
validationmw --> commentctrl
errorhandler --> chatctrl

authctrl --> userservice
userctrl --> userservice
vibectrl --> vibeservice
commentctrl --> commentmodel
chatctrl --> chatservice

userservice --> usermodel
vibeservice --> vibemodel
chatservice --> messagemodel
emailservice --> verificationservice

usermodel --> mongodb
vibemodel --> mongodb
commentmodel --> mongodb
messagemodel --> mongodb
verificationservice --> redis
uploadmw --> s3client

@enduml
```

### 9. Security Architecture Flow

```plantuml
@startuml Security_Architecture
actor User
participant "Load Balancer" as lb
participant "Rate Limiter" as ratelimit
participant "CORS Handler" as cors
participant "Helmet Security" as helmet
participant "Auth Middleware" as auth
participant "JWT Service" as jwt
participant "API Endpoint" as endpoint
participant "Database" as db

User -> lb: HTTPS Request
lb -> ratelimit: Forward request
ratelimit -> ratelimit: Check rate limits
ratelimit -> cors: Apply CORS policy
cors -> helmet: Set security headers
helmet -> auth: Authenticate request

alt JWT Token Present
  auth -> jwt: Verify JWT token
  jwt -> auth: Token valid/invalid
  auth -> endpoint: Proceed with user context
else No Token
  auth -> endpoint: Proceed as guest (limited access)
end

endpoint -> db: Execute business logic
db -> endpoint: Return data
endpoint -> helmet: Send response
helmet -> cors: Apply CORS headers
cors -> ratelimit: Update rate limit counters
ratelimit -> lb: Send response
lb -> User: HTTPS Response

note right of auth
  Supports both:
  - Authorization: Bearer <token>
  - HTTP-only cookies
end note

note right of ratelimit
  100 requests per IP
  per 15-minute window
end note

@enduml
```

### 10. Deployment Architecture

```plantuml
@startuml Deployment_Architecture
node "Load Balancer" {
  component [NGINX/ALB] as lb
}

node "Application Server 1" {
  component [Node.js + Bun] as app1
  component [Socket.io Instance] as socket1
}

node "Application Server 2" {
  component [Node.js + Bun] as app2
  component [Socket.io Instance] as socket2
}

database "MongoDB Cluster" {
  component [Primary] as mongo_primary
  component [Secondary] as mongo_secondary
  component [Arbiter] as mongo_arbiter
}

database "Redis Cluster" {
  component [Redis Master] as redis_master
  component [Redis Slave] as redis_slave
}

cloud "AWS S3" {
  component [Media Bucket] as s3_media
  component [Static Assets] as s3_static
}

cloud "Email Service" {
  component [SMTP Provider] as smtp
}

cloud "CDN" {
  component [CloudFront] as cdn
}

lb --> app1
lb --> app2

app1 --> mongo_primary
app2 --> mongo_primary
mongo_primary --> mongo_secondary
mongo_secondary --> mongo_arbiter

app1 --> redis_master
app2 --> redis_master
redis_master --> redis_slave

app1 --> s3_media
app2 --> s3_media
app1 --> smtp
app2 --> smtp

cdn --> s3_static
cdn --> s3_media

note right of socket1
  Socket.io uses Redis
  for cross-server
  communication
end note

@enduml
```

## Key Technical Specifications for SDD

### 1. Performance Requirements
- **Response Time**: < 200ms for API calls
- **Concurrent Users**: Support 10,000 simultaneous connections
- **File Upload**: Handle 10MB files efficiently
- **Database**: Sub-100ms query response time
- **WebSocket**: Real-time message delivery < 50ms

### 2. Scalability Requirements
- **Horizontal Scaling**: Stateless application servers
- **Database Sharding**: MongoDB horizontal scaling
- **CDN Integration**: Global content delivery
- **Load Balancing**: Multi-server deployment
- **Auto-scaling**: Based on CPU/memory metrics

### 3. Security Requirements
- **Authentication**: JWT with 7-day expiry
- **Authorization**: Role-based access control
- **Data Encryption**: HTTPS/TLS in transit, bcrypt for passwords
- **Rate Limiting**: 100 requests/15min per IP
- **Input Validation**: Server-side validation for all inputs
- **File Security**: Type and size validation for uploads

### 4. Availability Requirements
- **Uptime**: 99.9% availability target
- **Backup**: Daily automated database backups
- **Disaster Recovery**: Cross-region replication
- **Monitoring**: Health checks and alerting
- **Graceful Degradation**: Core features available during partial outages

### 5. Data Requirements
- **Data Retention**:
  - Active vibes: 24 hours
  - Archived vibes: 30 days
  - User data: Indefinite (until account deletion)
  - Chat messages: 1 year
- **Backup Strategy**:
  - Daily full backups
  - Point-in-time recovery capability
  - Cross-region backup storage

### 6. Integration Requirements
- **AWS S3**: Media file storage and CDN
- **SMTP**: Email delivery service
- **Redis**: Session management and caching
- **MongoDB**: Primary data storage
- **Socket.io**: Real-time communication

### 7. Browser/Platform Support
- **Web Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: Progressive Web App (PWA) support
- **API**: RESTful HTTP/HTTPS with WebSocket support
- **Real-time**: Socket.io with fallback transports
