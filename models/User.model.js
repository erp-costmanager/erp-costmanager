const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: true,
    },
    lastName: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    role: {
      type: String,
      enum: ["Employee", "Manager", "Admin"],
      default: "Employee",
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Disapproved", "Removed"],
      default: "Pending",
    },
    pictureURL: String,
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
