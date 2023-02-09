const { Schema, model } = require("mongoose");

const companyModel = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    users: [{ type: Schema.Types.ObjectId, ref: "User" }],
    purchases: [{ type: Schema.Types.ObjectId, ref: "Purchase" }],
    departments: [{ type: Schema.Types.ObjectId, ref: "Department" }],
  },
  {
    timestamps: true,
  }
);

const Company = model("Company", companyModel);

module.exports = Company;
