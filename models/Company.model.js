const { Schema, model } = require("mongoose");

const companyModel = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    users: [{ type: Schema.Types.ObjectId, ref: "User" }],
    purchases: [{ type: Schema.Types.ObjectId, ref: "Purchase" }],
  },
  {
    timestamps: true,
  }
);

module.exports = model("Company", companyModel);
