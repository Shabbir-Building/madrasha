import mongoose, { type Schema } from "mongoose";

const studentEnrollmentSchema: Schema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Student",
    },
    group: {
      type: Number,
      required: true,
    },
    section: {
      type: Number,
    },
    class: {
      type: Number,
    },
    roll: {
      type: Number,
      required: true,
    },
    academic_year: {
      type: Number,
      required: true,
    },
    fee: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const StudentEnrollment = mongoose.model(
  "StudentEnrollment",
  studentEnrollmentSchema,
);
