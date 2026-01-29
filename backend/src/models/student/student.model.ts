import mongoose, { type Schema } from "mongoose";

const studentSchema: Schema = new mongoose.Schema(
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
    fullname: {
      type: String,
      required: true,
      maxlength: 100,
    },
    profile_image: {
      type: String,
      maxlength: 255,
    },
    blood_group: {
      type: String,
      required: true,
      maxlength: 10,
    },
    gender: {
      type: String,
      required: true,
      maxlength: 50,
    },
    birth_certificate_no: {
      type: String,
      required: true,
      validate: {
        validator: function (value: string) {
          return /^\d{17}$/.test(value);
        },
        message: "Birth certificate number must be exactly 17 digits",
      },
    },
    registration_date: {
      type: Date,
      required: true,
    },
    is_residential: {
      type: Boolean,
    },
    residential_category: {
      type: String,
    },
    residential_fee: {
      type: Number,
      default: 0,
      min: 0,
    },
    is_day_care: {
      type: Boolean,
    },
    waiver_amount: {
      type: Number,
      min: 0,
    },
    current_location: {
      type: String,
      required: true,
      maxlength: 150,
    },
    permanent_location: {
      type: String,
      required: true,
      maxlength: 150,
    },
    disable: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Student = mongoose.model("Student", studentSchema);
