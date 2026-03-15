const express = require("express")
const multer = require("multer")
const authMiddleware = require("../middleware/auth")
const Attendance = require("../models/Attendance")
const getDistanceMeters = require("../utils/distance")

const router = express.Router()

const SHOP_LAT = parseFloat(process.env.SHOP_LAT)
const SHOP_LNG = parseFloat(process.env.SHOP_LNG)

const MAX_DIST = parseFloat(process.env.MAX_DISTANCE_METERS)

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    const fileName = Date.now() + "-" + file.originalname
    cb(null, fileName)
  }
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
})

function verifyLocation(latitude, longitude) {
  const distance = getDistanceMeters(latitude, longitude, SHOP_LAT, SHOP_LNG)

  return {
    distance: Math.round(distance),
    allowed: distance <= MAX_DIST
  }
}

function getTodayDate() {
  return new Date().toISOString().split("T")[0]
}

router.post("/checkin", authMiddleware, upload.single("image"), async (req, res) => {
  try {

    const { latitude, longitude } = req.body

    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)

    const locationCheck = verifyLocation(lat, lng)

    if (!locationCheck.allowed) {
      return res.status(403).json({
        message: `You are not near the shop. You are ${locationCheck.distance}m away. Please move closer to mark attendance.`
      })
    }

    const today = getTodayDate()

    const existingRecord = await Attendance.findOne({
      userId: req.user._id,
      date: today
    })

    if (existingRecord && existingRecord.checkIn && existingRecord.checkIn.time) {
      return res.status(400).json({
        message: "You have already checked in today."
      })
    }

    const imageUrl = req.file ? "/uploads/" + req.file.filename : null

    let record

    if (existingRecord) {

      record = await Attendance.findByIdAndUpdate(
        existingRecord._id,
        {
          checkIn: {
            time: new Date(),
            latitude: lat,
            longitude: lng,
            image: imageUrl
          }
        },
        { new: true }
      )

    } else {

      record = await Attendance.create({
        userId: req.user._id,
        date: today,
        checkIn: {
          time: new Date(),
          latitude: lat,
          longitude: lng,
          image: imageUrl
        }
      })

    }

    res.json({
      message: "Checked in successfully",
      record: record,
      distance: locationCheck.distance
    })

  } catch (error) {

    res.status(500).json({
      message: error.message
    })

  }
})

router.post("/checkout", authMiddleware, upload.single("image"), async (req, res) => {
  try {

    const { latitude, longitude } = req.body

    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)

    const locationCheck = verifyLocation(lat, lng)

    if (!locationCheck.allowed) {
      return res.status(403).json({
        message: `You are not near the shop. You are ${locationCheck.distance}m away. Please move closer to mark attendance.`
      })
    }

    const today = getTodayDate()

    const record = await Attendance.findOne({
      userId: req.user._id,
      date: today
    })

    if (!record || !record.checkIn || !record.checkIn.time) {
      return res.status(400).json({
        message: "You have not checked in today."
      })
    }

    if (record.checkOut && record.checkOut.time) {
      return res.status(400).json({
        message: "You have already checked out today."
      })
    }

    const imageUrl = req.file ? "/uploads/" + req.file.filename : null

    const updatedRecord = await Attendance.findByIdAndUpdate(
      record._id,
      {
        checkOut: {
          time: new Date(),
          latitude: lat,
          longitude: lng,
          image: imageUrl
        }
      },
      { new: true }
    )

    res.json({
      message: "Checked out successfully",
      record: updatedRecord,
      distance: locationCheck.distance
    })

  } catch (error) {

    res.status(500).json({
      message: error.message
    })

  }
})

router.get("/user/:userId", authMiddleware, async (req, res) => {
  try {
    // Security: Ensure users can only access their own records
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ message: "Access denied. You can only view your own records." })
    }

    const records = await Attendance.find({
      userId: req.params.userId
    })
      .sort({ date: -1 })
      .limit(30)

    res.json(records)

  } catch (error) {

    res.status(500).json({
      message: error.message
    })

  }
})

router.get("/today", authMiddleware, async (req, res) => {
  try {

    const today = getTodayDate()

    const record = await Attendance.findOne({
      userId: req.user._id,
      date: today
    })

    res.json(record || null)

  } catch (error) {

    res.status(500).json({
      message: error.message
    })

  }
})

module.exports = router