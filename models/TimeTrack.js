import mongoose from "mongoose";

const punchSchema = new mongoose.Schema(
  {
    punchIn: {
      type: Date,
      required: true,
    },
    punchOut: {
      type: Date,
      default: null,
    },
  },
  { _id: false },
);

const timeTrackSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: {
      type: String,
      default: () => new Date().toLocaleDateString(),
    },
    punches: [punchSchema],
    clockIn: {
      type: Date,
    },
    clockOut: {
      type: Date,
      default: null,
    },
    totalMinutes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("TimeTrack", timeTrackSchema);
