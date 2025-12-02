import mongoose, { type Schema } from "mongoose";

const donationSchema: Schema = new mongoose.Schema(
  {
    admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Admin",
    },
    branch: {
      type: Number,
      required: true,
    },
    donation_type: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
    },
    fullname: {
      type: String,
      required: true,
      maxlength: 100,
    },
    phone_number: {
      type: String,
      required: true,
      maxlength: 15,
    },
    donation_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    donation_date: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      maxlength: 255,
    },
  },
  {
    timestamps: true,
  }
);

export const Donation = mongoose.model("Donation", donationSchema);
