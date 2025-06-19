import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createClient } from 'redis';
import authRoutes from './routes/auth.routes';
import feedRoutes from './routes/feed.routes';
import postRoutes from './routes/post.routes';
import userRoutes from './routes/user.routes';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' },
});

const redis = createClient();
redis.connect().catch(console.error);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || '';
const REDIS_CHANNEL = 'new_post';


app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Backend is running at http://localhost:5000');
});


// getting auth routes in action...
app.use('/api/auth', authRoutes);

// route for creating post...
app.use('/api/posts', postRoutes);

// routes for the stored social celeb feed...
app.use('/api/feed', feedRoutes);

//route for celebrities follow feature...
app.use('/api/users', userRoutes);




//websocket connection
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('subscribe', (userId: string) => {
        socket.join(userId);
        console.log(`Subscribed to userId ${userId}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });

});

// Redis subscription
redis.subscribe(REDIS_CHANNEL, (message) => {
    const data = JSON.parse(message);
    const { followers, notification} = data;

    followers.forEach((followerId: string)  => {
        io.to(followerId).emit('new_post', notification);  
    });
});

// MongoDB connection
mongoose
    .connect(MONGO_URI)
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection failed:', error);
    });

    