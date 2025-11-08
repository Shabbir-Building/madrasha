import { type Request, type Response } from "express";
import mongoose from "mongoose";

import { HttpStatus, PAGINATION_DEFAULTS } from "../config/constants";
import { type AuthenticatedAdmin } from "../middlewares/auth/types";
import { Student } from "../models/student/student.model";
import { StudentEnrollment } from "../models/student/studentEnrollment.model";
import { StudentGuardian } from "../models/student/studentGuardian.model";
import type {
  CreateStudentPayload,
  UpdateStudentPayload,
  StudentListItem,
  StudentDetails,
} from "../models/student/types";
import { type ApiResponse, type PaginationResult } from "../types/common";
import { AppError } from "../utils/AppError";

export const getStudents = async (
  req: Request,
  res: Response
): Promise<void> => {
  const page = Math.max(1, Number(req.query.page) || PAGINATION_DEFAULTS.PAGE);
  const limit = Math.min(
    Number(req.query.limit) || 1000,
    PAGINATION_DEFAULTS.MAX_LIMIT
  );

  const skip = (page - 1) * limit;

  // MongoDB aggregation pipeline to join Student, StudentEnrollment, and StudentGuardian
  const activeMatchStage = {
    $match: {
      $or: [{ disable: { $exists: false } }, { disable: { $ne: true } }],
    },
  };

  const pipeline = [
    activeMatchStage,
    {
      $lookup: {
        from: "studentenrollments",
        localField: "_id",
        foreignField: "student_id",
        as: "enrollments",
      },
    },
    {
      $lookup: {
        from: "studentguardians",
        localField: "_id",
        foreignField: "student_id",
        as: "guardian_data",
      },
    },
    {
      $unwind: {
        path: "$guardian_data",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        enrollment_years: {
          $map: {
            input: "$enrollments",
            as: "enrollment",
            in: "$$enrollment.academic_year",
          },
        },
        latest_enrollment: {
          $arrayElemAt: [
            {
              $sortArray: {
                input: "$enrollments",
                sortBy: { academic_year: -1 },
              },
            },
            0,
          ],
        },
      },
    },
    {
      $project: {
        _id: 1,
        fullname: 1,
        profile_image: 1,
        branch: 1,
        is_residential: 1,
        section: "$latest_enrollment.section",
        class: "$latest_enrollment.class",
        enrollment_years: 1,
        guardian: {
          name: "$guardian_data.guardian_name",
          phone: "$guardian_data.phone_number",
        },
        disable: 1,
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ];

  const [students, totalResult] = await Promise.all([
    Student.aggregate(pipeline),
    Student.countDocuments(activeMatchStage.$match),
  ]);

  const pages = Math.ceil(totalResult / limit);

  const paginationResult: PaginationResult<StudentListItem> = {
    docs: students as StudentListItem[],
    total: totalResult,
    page,
    pages,
    limit,
    hasNext: page < pages,
    hasPrev: page > 1,
  };

  const response: ApiResponse<PaginationResult<StudentListItem>> = {
    success: true,
    message: "Students retrieved successfully",
    data: paginationResult,
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
};

export const getStudentById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid student ID format", HttpStatus.BAD_REQUEST);
  }

  const studentObjectId = new mongoose.Types.ObjectId(id);

  // MongoDB aggregation pipeline to join Student, StudentEnrollment, and StudentGuardian
  const pipeline = [
    {
      $match: {
        _id: studentObjectId,
        $or: [{ disable: { $exists: false } }, { disable: { $ne: true } }],
      },
    },
    {
      $lookup: {
        from: "studentenrollments",
        localField: "_id",
        foreignField: "student_id",
        as: "enrollments",
      },
    },
    {
      $lookup: {
        from: "studentguardians",
        localField: "_id",
        foreignField: "student_id",
        as: "guardian_data",
      },
    },
    {
      $unwind: {
        path: "$guardian_data",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        latest_enrollment: {
          $arrayElemAt: [
            {
              $sortArray: {
                input: "$enrollments",
                sortBy: { academic_year: -1 },
              },
            },
            0,
          ],
        },
      },
    },
    {
      $project: {
        _id: 1,
        branch: 1,
        fullname: 1,
        profile_image: 1,
        blood_group: 1,
        gender: 1,
        birth_certificate_no: 1,
        registration_date: 1,
        is_residential: 1,
        residential_category: 1,
        residential_fee: 1,
        is_day_care: 1,
        waiver_amount: 1,
        current_location: 1,
        permanent_location: 1,
        disable: 1,
        enrollment: {
          group: "$latest_enrollment.group",
          section: "$latest_enrollment.section",
          class: "$latest_enrollment.class",
          roll: "$latest_enrollment.roll",
          academic_year: "$latest_enrollment.academic_year",
          fee: "$latest_enrollment.fee",
        },
        guardian: {
          guardian_name: "$guardian_data.guardian_name",
          guardian_relation: "$guardian_data.guardian_relation",
          phone_number: "$guardian_data.phone_number",
          current_location: "$guardian_data.current_location",
          permanent_location: "$guardian_data.permanent_location",
        },
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ];

  const result = await Student.aggregate(pipeline);

  if (!result || result.length === 0) {
    throw new AppError("Student not found", HttpStatus.NOT_FOUND);
  }

  const student = result[0] as StudentDetails;

  const response: ApiResponse<StudentDetails> = {
    success: true,
    message: "Student retrieved successfully",
    data: student,
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
};

export const createStudent = async (
  req: Request,
  res: Response
): Promise<void> => {
  const admin = res.locals.admin as AuthenticatedAdmin | undefined;

  if (!admin?.sub) {
    throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED);
  }

  const payload: CreateStudentPayload = req.body;

  const registrationDate = new Date(payload.registration_date);
  if (Number.isNaN(registrationDate.getTime())) {
    throw new AppError("Invalid registration date", HttpStatus.BAD_REQUEST);
  }

  const adminObjectId = new mongoose.Types.ObjectId(admin.sub);

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const [student] = await Student.create(
      [
        {
          admin_id: adminObjectId,
          branch: payload.branch,
          fullname: payload.full_name,
          profile_image: payload.profile_image,
          blood_group: payload.blood_group,
          gender: payload.gender,
          birth_certificate_no: payload.birth_certificate_no,
          registration_date: registrationDate,
          is_residential: payload.residential,
          residential_category: payload.residential
            ? payload.residential_category
            : undefined,
          residential_fee: payload.residential
            ? payload.residential_fee ?? 0
            : 0,
          is_day_care: payload.day_care,
          waiver_amount: payload.waiver_amount ?? 0,
          current_location: payload.current_location,
          permanent_location: payload.permanent_location,
          disable: payload.disable ?? false,
        },
      ],
      { session }
    );

    await StudentEnrollment.create(
      [
        {
          student_id: student._id,
          group: payload.group ?? 0,
          section: payload.section ?? undefined,
          class: payload.class ?? undefined,
          roll: payload.roll,
          academic_year: registrationDate.getFullYear(),
          fee: payload.class_fee,
        },
      ],
      { session }
    );

    await StudentGuardian.create(
      [
        {
          student_id: student._id,
          guardian_name: payload.guardian_name,
          guardian_relation: payload.guardian_relation,
          phone_number: payload.phone_number,
          current_location: payload.guardian_current_location,
          permanent_location: payload.guardian_permanent_location,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    const response: ApiResponse = {
      success: true,
      message: "Student created successfully",
      timestamp: new Date().toISOString(),
    };

    res.status(HttpStatus.CREATED).json(response);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const updateStudent = async (
  req: Request,
  res: Response
): Promise<void> => {
  const admin = res.locals.admin as AuthenticatedAdmin | undefined;

  if (!admin?.sub) {
    throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED);
  }

  const { id } = req.params as { id: string };

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid student ID", HttpStatus.BAD_REQUEST);
  }

  const payload: UpdateStudentPayload = req.body;

  const registrationDate = new Date(payload.registration_date);
  if (Number.isNaN(registrationDate.getTime())) {
    throw new AppError("Invalid registration date", HttpStatus.BAD_REQUEST);
  }

  const studentObjectId = new mongoose.Types.ObjectId(id);

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const student = await Student.findById(studentObjectId).session(session);
    if (!student) {
      throw new AppError("Student not found", HttpStatus.NOT_FOUND);
    }

    const studentUpdateData: Record<string, unknown> = {
      branch: payload.branch,
      fullname: payload.full_name,
      profile_image: payload.profile_image,
      blood_group: payload.blood_group,
      gender: payload.gender,
      birth_certificate_no: payload.birth_certificate_no,
      registration_date: registrationDate,
      is_residential: payload.residential,
      residential_category: payload.residential
        ? payload.residential_category
        : undefined,
      residential_fee: payload.residential ? payload.residential_fee ?? 0 : 0,
      is_day_care: payload.day_care,
      waiver_amount: payload.waiver_amount ?? 0,
      current_location: payload.current_location,
      permanent_location: payload.permanent_location,
    };

    if (typeof payload.disable === "boolean") {
      studentUpdateData.disable = payload.disable;
    }

    await Student.updateOne(
      { _id: studentObjectId },
      {
        $set: {
          ...studentUpdateData,
        },
      },
      { session }
    );

    await StudentEnrollment.findOneAndUpdate(
      { student_id: studentObjectId },
      {
        $set: {
          group: payload.group ?? 0,
          section: payload.section ?? undefined,
          class: payload.class ?? undefined,
          roll: payload.roll,
          academic_year: registrationDate.getFullYear(),
          fee: payload.class_fee,
        },
      },
      { session, upsert: true, new: false }
    );

    await StudentGuardian.findOneAndUpdate(
      { student_id: studentObjectId },
      {
        $set: {
          guardian_name: payload.guardian_name,
          guardian_relation: payload.guardian_relation,
          phone_number: payload.phone_number,
          current_location: payload.guardian_current_location,
          permanent_location: payload.guardian_permanent_location,
        },
      },
      { session, upsert: true, new: false }
    );

    await session.commitTransaction();

    const response: ApiResponse = {
      success: true,
      message: "Student updated successfully",
      timestamp: new Date().toISOString(),
    };

    res.status(HttpStatus.OK).json(response);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
