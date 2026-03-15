const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true
  },

  userId: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  }
},
{
  timestamps: true
}
)

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return
  }

  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(this.password, salt)
  
  this.password = hashedPassword
})

userSchema.methods.matchPassword = async function (enteredPassword) {
  const isMatch = await bcrypt.compare(enteredPassword, this.password)
  return isMatch
}

module.exports = mongoose.model("User", userSchema)