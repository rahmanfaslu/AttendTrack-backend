const express = require("express")
const jwt = require("jsonwebtoken")
const User = require("../models/User")

const router = express.Router()

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" })
}

router.post("/register", async (req, res) => {
  try {

    const { name, userId, password } = req.body

    const existingUser = await User.findOne({ userId })

    if (existingUser) {
      return res.status(400).json({ message: "User ID already exists" })
    }

    const newUser = await User.create({
      name,
      userId,
      password
    })

    const token = generateToken(newUser._id)

    res.status(201).json({
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        userId: newUser.userId
      }
    })

  } catch (error) {

    res.status(500).json({
      message: error.message
    })

  }
})

router.post("/login", async (req, res) => {
  try {

    const { userId, password } = req.body

    const user = await User.findOne({ userId })

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const passwordMatch = await user.matchPassword(password)

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const token = generateToken(user._id)

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        userId: user.userId
      }
    })

  } catch (error) {

    res.status(500).json({
      message: error.message
    })

  }
})

module.exports = router