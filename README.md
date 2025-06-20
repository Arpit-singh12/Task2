# Socially - A Mini Social App

## Overview

Socially is a mini full-stack social media application built with **MERN stack (MongoDB, Express.js, React.js, Node.js)**, featuring real-time updates, infinite scroll, and two types of users: **Celebrities** and **Public Users**. This documentation outlines the project structure, key features, implementation, and setup instructions.

---

## Project Objectives

* Support two user roles: **Celebrity** and **Public**
* Allow celebrities to create text/image posts
* Allow public users to follow celebrities
* Provide real-time updates when new posts are made
* Enable infinite scrolling in the feed
* Notification and engagement features (like, comment placeholders)

---

## Technologies Used

* **Frontend**: React.js, TypeScript, Tailwind CSS
* **Backend**: Node.js, Express.js, TypeScript
* **Database**: MongoDB (with Mongoose)
* **Real-Time**: Socket.IO, Redis Pub/Sub
* **Authentication**: JWT (JSON Web Tokens)

---

## Features

### 1. Authentication

* Mock login with JWT token
* `GET /auth/me` for fetching current user
* Role-based logic to distinguish between celebrity and public users

### 2. Celebrity User Functionality

* Create text/image posts (`POST /api/posts`)
* View own posts (`GET /api/posts/self`)
* Real-time post broadcast via WebSocket + Redis

### 3. Public User Functionality

* View feed from followed celebrities (`GET /api/feed`)
* Follow/unfollow celebrities (`POST /api/users/:id/follow`)
* Notification badge updates on new posts

### 4. Feed & Infinite Scroll

* Posts are paginated from backend (`GET /api/posts?page=X&limit=Y`)
* Frontend uses IntersectionObserver to auto-load posts
* UI updates with "You're all caught up" when no more posts

### 5. Real-Time

* Redis Pub/Sub used to broadcast new post notifications
* Socket.IO delivers updates to all subscribed public users
* `socket.join(userId)` on login to enable targeted emits

---

## Folder Structure (Backend)

```
backend/
├── controllers/
│   ├── auth.controller.ts
│   ├── post.controller.ts
│   └── feed.controller.ts
├── models/
├── routes/
│   ├── auth.routes.ts
│   ├── post.routes.ts
│   ├── feed.routes.ts
│   └── user.routes.ts
├── middlewares/
├── index.ts
```

## Folder Structure (Frontend)

```
frontend/
├── src/
│   ├── components/
│   │   ├── Feed.tsx
│   │   └── PostCard.tsx
│   ├── contexts/
│   │   └── AppContext.tsx
│   ├── data/
│   │   └── mockData.ts
│   ├── api/
│   │   └── axios.ts
│   └── types.ts
```

---

## How to Run the Project

### Backend

```bash
cd backend
npm install
npm run dev
```

Make sure `.env` includes:

```
PORT=5000
MONGO_URI=<your_mongo_uri>
JWT_SECRET=<your_jwt_secret>
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Future Enhancements

* Commenting system on posts
* Like count syncing across clients in real time
* Notifications tab UI
* User profile view
* Media upload using S3 or Cloudinary

---

## Contributors

* Arpit Singh (Developer & Architect)

---


