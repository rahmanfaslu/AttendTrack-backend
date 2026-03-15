const mongoose = require("mongoose")

const attendanceSchema = new mongoose.Schema(
{
  // Main Record Info
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  date: {
    type: String,
    required: true
  },

  // Check-In Details
  checkIn: {
    time: Date,
    latitude: Number,
    longitude: Number,
    image: String
  },

  // Check-Out Details
  checkOut: {
    time: Date,
    latitude: Number,
    longitude: Number,
    image: String
  }

},
{
  timestamps: true
}
)

attendanceSchema.index(
  { userId: 1, date: 1 },
  { unique: true }
)

module.exports = mongoose.model("Attendance", attendanceSchema)