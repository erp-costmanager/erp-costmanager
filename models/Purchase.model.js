const { Schema, model } = require("mongoose");

const purchaseModel = new Schema(
  {
    item: { type: String, required: true, trim: true },
    cost: { type: Number, required: true, trim: true },
    reason: { type: String, require: true, trim: true },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      require: true,
      trim: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Denied"],
      default: "Pending",
      require: true,
      trim: true,
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

const Purchase = model("Purchase", purchaseModel);

module.exports = Purchase;
