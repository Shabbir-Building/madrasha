import mongoose, { type Schema } from "mongoose";
import { UserRole } from "../../config/constants";
import { generateStrongPassword } from "./utils";
import { hashPassword } from "../../utils/password";

const adminSchema: Schema = new mongoose.Schema(
  {
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: "Employee",
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: Number,
      default: UserRole.ADMIN,
    },
    access_boys_section: {
      type: Boolean,
      required: true,
    },
    access_girls_section: {
      type: Boolean,
      required: true,
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

adminSchema.pre("save", async function (next) {
  if (this.isNew && !this.password) {
    const plainPassword = generateStrongPassword();
    this.password = await hashPassword(plainPassword);
  }
  next();
});

export const Admin = mongoose.model("Admin", adminSchema);
