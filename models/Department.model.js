const { Schema, model } = require("mongoose");

const departmentModel = new Schema(
  {
    name: {
      type: String,
      enum: [
        "Business development",
        "Customer service",
        "Engineering",
        "Finance",
        "General management",
        "Human resources",
        "IT",
        "Legal",
        "Marketing",
        "Operations",
        "Sales",
      ],
      required: true,
    },
    company: { type: Schema.Types.ObjectId, ref: "Company" },
    users: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

const Department = model("Department", departmentModel);

module.exports = Department;
