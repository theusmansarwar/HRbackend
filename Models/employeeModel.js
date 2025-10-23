const e = require("express");
const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Female", "Male", "Other"],
      required: true,
    },
    cnic: {
      type: String,
      required: true,
      unique: true,
      length: 13,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    designationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Designation",
      required: true,
    }
    ,
    employeementType: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    salary: {
      type: Number,
      required: true,
      min: 0,
    },
    bankAccountNo: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    emergencyContactName: {
      type: String,
    },
    emergencyContactNo: {
      type: String,
    },
    profileImage: {
      type: mongoose.Schema.Types.Mixed,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
const Employee = mongoose.model("Employee", employeeSchema);
module.exports = Employee;
