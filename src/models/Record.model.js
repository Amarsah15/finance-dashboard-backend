import mongoose from "mongoose";

const recordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Creates a relationship with the User model
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    type: {
      type: String,
      enum: ["income", "expense"], // Restricts types to these two options
      required: [true, "Type must be either income or expense"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);

// We add an index here to make dashboard aggregations much faster later
recordSchema.index({ user: 1, date: -1 });
recordSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days

const Record = mongoose.model("Record", recordSchema);
export default Record;
