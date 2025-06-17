import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    displayName: string;
    role: 'celebrity' | 'follower';
    avatar: string;
    bio?: string;
    verified?: boolean;
    password: string;
};


const userSchema: Schema = new Schema(
    {
        username: { type: String, required: true, unique: true},
        displayName: { type: String, required: true },
        role: { type: String, enum: ['celebrity', 'public'], required: true},
        avatar: { type: String, required: true},
        bio: { type: String},
        verified: { type: Boolean, default: false },
        password: { type: String, required: true }
    },
    {timestamps: true}
);

export default mongoose.model<IUser>('User', userSchema);