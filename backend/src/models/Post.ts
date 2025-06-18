import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
    authorId: string,
    content: string,
    image?: string,
    timestamp: number,
    likes: number,
    comments: string
}

const postSchema: Schema = new Schema({
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    contents: { type: String, required: true },
    image: {type: String},
    timestamp: { type: Number, required: true },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model<IPost>('Post', postSchema);