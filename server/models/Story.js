import mongoose from 'mongoose';

const storySchema = new mongoose.Schema(
  {
    prompt: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: false, 
    },
    story: {
      type: String,
      required: true,
    },
    moral: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Story', storySchema);