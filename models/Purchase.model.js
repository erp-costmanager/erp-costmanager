const { Schema, model } = require("mongoose");

const purchaseModel = new Schema(
  {
    item: { type: String, required: true },
    cost: { type: Number, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Denied"],
      default: "Pending",
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Purchase", purchaseModel);
