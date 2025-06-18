import mongoose, { Document, Schema } from 'mongoose';

// adding list of followers and following to the db...

export interface IFollow extends Document {
    followerId: string;
    followingId: string;
}

// defining follower list attributes...

const followSchema: Schema = new Schema({
      followerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      followingId: { type:Schema.Types.ObjectId, ref: 'User', required: true},
}, { timestamps: true});

export default mongoose.model<IFollow>('Follow', followSchema);