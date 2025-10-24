import mongoose from "mongoose";

const pointsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  points: {
    type: Number,
    default: 0,
  },
});

const Points = mongoose.model("Points", pointsSchema);

export default Points;
