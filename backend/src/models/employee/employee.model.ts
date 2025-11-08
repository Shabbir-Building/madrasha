import mongoose, { type Schema } from "mongoose";

const employeeSchema: Schema = new mongoose.Schema(
  {
    branch: {
      type: Number,
      required: true,
    },
    employment_type: {
      type: Number,
      required: true,
    },
    designation: {
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
    },
    nid_no: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v: string) {
          return /^\d{10}$/.test(v);
        },
        message: "NID number must be exactly 10 digits",
      },
    },
    gender: {
      type: String,
      required: true,
      maxlength: 20,
    },
    phone_number: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v: string) {
          return /^01\d{9}$/.test(v);
        },
        message: "Phone number must be 11 digits starting with 01",
      },
    },
    join_date: {
      type: Date,
      required: true,
    },
    resign_date: {
      type: Date,
    },
    salary: {
      type: Number,
      required: true,
      min: 0,
      max: 9999999999,
    },
    bonus: {
      type: Number,
      default: 0,
      min: 0,
      max: 9999999999,
    },
    current_location: {
      type: String,
      required: true,
      maxlength: 250,
    },
    permanent_location: {
      type: String,
      required: true,
      maxlength: 250,
    },
    disable: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Employee = mongoose.model("Employee", employeeSchema);
