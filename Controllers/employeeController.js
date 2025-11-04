// controllers/employeeController.js
import Employee from "../Models/employeeModel.js";
import { logActivity } from "../utils/activityLogger.js";

const ValidationRules = {
  // Name validation: Only letters, spaces, hyphens, apostrophes
  name: {
    pattern: /^[a-zA-Z\s\-']+$/,
    minLength: 2,
    maxLength: 50,
    message: "Use only letters, spaces, - and '",
  },
  
  // Email validation
  email: {
    pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message: "Invalid email format",
  },
  
  // Phone validation: 10-15 digits
  phone: {
    pattern: /^[\d\s\-\+\(\)]{10,20}$/,
    digitPattern: /\d/g,
    minDigits: 10,
    maxDigits: 15,
    message: "Must contain 10-15 digits",
  },
  
  // CNIC validation: 13 digits (format: 12345-1234567-1)
  cnic: {
    pattern: /^\d{5}-\d{7}-\d{1}$/,
    message: "Format must be 12345-1234567-1",
  },
  
  // Gender validation
  gender: {
    allowedValues: ['Male', 'Female', 'Other'],
    message: "Select Male, Female, or Other",
  },
  
  // Employment Type validation
  employmentType: {
    allowedValues: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    message: "Select valid employment type",
  },
  
  // Status validation
  status: {
    allowedValues: ['Active', 'Inactive', 'On Leave'],
    message: "Select Active, Inactive, or On Leave",
  },
  
  // Salary validation: Positive number
  salary: {
    min: 0,
    message: "Must be a positive number",
  },
  
  // Bank Account validation: 10-24 digits (IBAN support)
  bankAccount: {
    pattern: /^[A-Z0-9]{10,24}$/,
    digitsOnly: /^\d{10,24}$/,
    message: "Must be 10-24 alphanumeric characters",
  },
  
  // Address validation
  address: {
    pattern: /^[a-zA-Z0-9\s,.\-#/()]+$/,
    minLength: 10,
    maxLength: 200,
    message: "Use letters, numbers, spaces, and , . - # / ( )",
  },
};

// Validate Name (First/Last/Emergency Contact)
const validateName = (name, fieldName = "Name") => {
  if (!name || typeof name !== 'string' || !name.trim()) {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < ValidationRules.name.minLength) {
    return { valid: false, message: `Minimum ${ValidationRules.name.minLength} characters required` };
  }
  
  if (trimmedName.length > ValidationRules.name.maxLength) {
    return { valid: false, message: `Maximum ${ValidationRules.name.maxLength} characters allowed` };
  }
  
  if (!ValidationRules.name.pattern.test(trimmedName)) {
    return { valid: false, message: ValidationRules.name.message };
  }
  
  return { valid: true };
};

// Validate Email
const validateEmail = (email) => {
  if (!email || typeof email !== 'string' || !email.trim()) {
    return { valid: false, message: "Email is required" };
  }
  
  const trimmedEmail = email.trim().toLowerCase();
  
  if (!ValidationRules.email.pattern.test(trimmedEmail)) {
    return { valid: false, message: ValidationRules.email.message };
  }
  
  return { valid: true };
};

// Validate Phone
const validatePhone = (phone, fieldName = "Phone") => {
  if (!phone || typeof phone !== 'string' || !phone.trim()) {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  const trimmedPhone = phone.trim();
  const digits = trimmedPhone.match(ValidationRules.phone.digitPattern);
  
  if (!digits || digits.length < ValidationRules.phone.minDigits || digits.length > ValidationRules.phone.maxDigits) {
    return { valid: false, message: ValidationRules.phone.message };
  }
  
  if (!ValidationRules.phone.pattern.test(trimmedPhone)) {
    return { valid: false, message: "Invalid phone format" };
  }
  
  return { valid: true };
};

// Validate CNIC
const validateCNIC = (cnic) => {
  if (!cnic || typeof cnic !== 'string' || !cnic.trim()) {
    return { valid: false, message: "CNIC is required" };
  }
  
  const trimmedCNIC = cnic.trim();
  
  if (!ValidationRules.cnic.pattern.test(trimmedCNIC)) {
    return { valid: false, message: ValidationRules.cnic.message };
  }
  
  return { valid: true };
};

// Validate Date of Birth
const validateDateOfBirth = (dateOfBirth) => {
  if (!dateOfBirth || typeof dateOfBirth !== 'string' || !dateOfBirth.trim()) {
    return { valid: false, message: "Date of Birth is required" };
  }
  
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) {
    return { valid: false, message: "Invalid date format" };
  }
  
  // Check if date is not in future
  const today = new Date();
  if (dob > today) {
    return { valid: false, message: "Date cannot be in future" };
  }
  
  // Check if age is at least 18 years
  const age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  const dayDiff = today.getDate() - dob.getDate();
  
  if (age < 18 || (age === 18 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)))) {
    return { valid: false, message: "Must be at least 18 years old" };
  }
  
  // Check if age is reasonable (not more than 100 years)
  if (age > 100) {
    return { valid: false, message: "Invalid date of birth" };
  }
  
  return { valid: true };
};

// Validate Gender
const validateGender = (gender) => {
  if (!gender || typeof gender !== 'string' || !gender.trim()) {
    return { valid: false, message: "Gender is required" };
  }
  
  const trimmedGender = gender.trim();
  
  if (!ValidationRules.gender.allowedValues.includes(trimmedGender)) {
    return { valid: false, message: ValidationRules.gender.message };
  }
  
  return { valid: true };
};

// Validate Employment Type
const validateEmploymentType = (employmentType) => {
  if (!employmentType || typeof employmentType !== 'string' || !employmentType.trim()) {
    return { valid: false, message: "Employment Type is required" };
  }
  
  const trimmedType = employmentType.trim();
  
  if (!ValidationRules.employmentType.allowedValues.includes(trimmedType)) {
    return { valid: false, message: ValidationRules.employmentType.message };
  }
  
  return { valid: true };
};

// Validate Status
const validateStatus = (status) => {
  if (!status || typeof status !== 'string' || !status.trim()) {
    return { valid: false, message: "Status is required" };
  }
  
  const trimmedStatus = status.trim();
  
  if (!ValidationRules.status.allowedValues.includes(trimmedStatus)) {
    return { valid: false, message: ValidationRules.status.message };
  }
  
  return { valid: true };
};

// Validate Salary
const validateSalary = (salary) => {
  if (salary === undefined || salary === null || salary === '') {
    return { valid: false, message: "Salary is required" };
  }
  
  const salaryNum = parseFloat(salary);
  
  if (isNaN(salaryNum)) {
    return { valid: false, message: "Must be a valid number" };
  }
  
  if (salaryNum < ValidationRules.salary.min) {
    return { valid: false, message: ValidationRules.salary.message };
  }
  
  return { valid: true };
};

// Validate Bank Account
const validateBankAccount = (bankAccount) => {
  if (!bankAccount || typeof bankAccount !== 'string' || !bankAccount.trim()) {
    return { valid: false, message: "Bank Account is required" };
  }
  
  const trimmedAccount = bankAccount.trim().toUpperCase();
  
  // Allow both Pakistani format (digits only) and IBAN format (alphanumeric)
  const isPakistaniFormat = ValidationRules.bankAccount.digitsOnly.test(trimmedAccount);
  const isIBANFormat = ValidationRules.bankAccount.pattern.test(trimmedAccount);
  
  if (!isPakistaniFormat && !isIBANFormat) {
    return { valid: false, message: ValidationRules.bankAccount.message };
  }
  
  return { valid: true };
};

// Validate Address
const validateAddress = (address) => {
  if (!address || typeof address !== 'string' || !address.trim()) {
    return { valid: false, message: "Address is required" };
  }
  
  const trimmedAddress = address.trim();
  
  if (trimmedAddress.length < ValidationRules.address.minLength) {
    return { valid: false, message: `Minimum ${ValidationRules.address.minLength} characters required` };
  }
  
  if (trimmedAddress.length > ValidationRules.address.maxLength) {
    return { valid: false, message: `Maximum ${ValidationRules.address.maxLength} characters allowed` };
  }
  
  if (!ValidationRules.address.pattern.test(trimmedAddress)) {
    return { valid: false, message: ValidationRules.address.message };
  }
  
  return { valid: true };
};

// Validate Department/Designation ID
const validateId = (id, fieldName) => {
  if (!id || typeof id !== 'string' || !id.trim()) {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  return { valid: true };
};

const createEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      dateOfBirth,
      gender,
      cnic,
      departmentId,
      designationId,
      employeementType,
      status,
      salary,
      bankAccountNo,
      address,
      emergencyContactName,
      emergencyContactNo,
    } = req.body;

    const missingFields = [];

    // Validate First Name
    const firstNameValidation = validateName(firstName, "First Name");
    if (!firstNameValidation.valid) {
      missingFields.push({ name: "firstName", message: firstNameValidation.message });
    }

    // Validate Last Name
    const lastNameValidation = validateName(lastName, "Last Name");
    if (!lastNameValidation.valid) {
      missingFields.push({ name: "lastName", message: lastNameValidation.message });
    }

    // Validate Email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      missingFields.push({ name: "email", message: emailValidation.message });
    }

    // Validate Phone Number
    const phoneValidation = validatePhone(phoneNumber, "Phone Number");
    if (!phoneValidation.valid) {
      missingFields.push({ name: "phoneNumber", message: phoneValidation.message });
    }

    // Validate Date of Birth
    const dobValidation = validateDateOfBirth(dateOfBirth);
    if (!dobValidation.valid) {
      missingFields.push({ name: "dateOfBirth", message: dobValidation.message });
    }

    // Validate Gender
    const genderValidation = validateGender(gender);
    if (!genderValidation.valid) {
      missingFields.push({ name: "gender", message: genderValidation.message });
    }

    // Validate CNIC
    const cnicValidation = validateCNIC(cnic);
    if (!cnicValidation.valid) {
      missingFields.push({ name: "cnic", message: cnicValidation.message });
    }

    // Validate Department
    const deptValidation = validateId(departmentId, "Department");
    if (!deptValidation.valid) {
      missingFields.push({ name: "departmentId", message: deptValidation.message });
    }

    // Validate Designation
    const desigValidation = validateId(designationId, "Designation");
    if (!desigValidation.valid) {
      missingFields.push({ name: "designationId", message: desigValidation.message });
    }

    // Validate Employment Type
    const empTypeValidation = validateEmploymentType(employeementType);
    if (!empTypeValidation.valid) {
      missingFields.push({ name: "employeementType", message: empTypeValidation.message });
    }

    // Validate Status
    const statusValidation = validateStatus(status);
    if (!statusValidation.valid) {
      missingFields.push({ name: "status", message: statusValidation.message });
    }

    // Validate Salary
    const salaryValidation = validateSalary(salary);
    if (!salaryValidation.valid) {
      missingFields.push({ name: "salary", message: salaryValidation.message });
    }

    // Validate Bank Account
    const bankValidation = validateBankAccount(bankAccountNo);
    if (!bankValidation.valid) {
      missingFields.push({ name: "bankAccountNo", message: bankValidation.message });
    }

    // Validate Address
    const addressValidation = validateAddress(address);
    if (!addressValidation.valid) {
      missingFields.push({ name: "address", message: addressValidation.message });
    }

    // Validate Emergency Contact Name
    const emergNameValidation = validateName(emergencyContactName, "Emergency Contact Name");
    if (!emergNameValidation.valid) {
      missingFields.push({ name: "emergencyContactName", message: emergNameValidation.message });
    }

    // Validate Emergency Contact Number
    const emergPhoneValidation = validatePhone(emergencyContactNo, "Emergency Contact Number");
    if (!emergPhoneValidation.valid) {
      missingFields.push({ name: "emergencyContactNo", message: emergPhoneValidation.message });
    }

    // Return all validation errors
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Validation failed. Please correct the errors.",
        missingFields,
      });
    }

    // Check for duplicate email
    const existingEmployee = await Employee.findOne({ 
      email: email.trim().toLowerCase(), 
      isArchived: false 
    });
    
    if (existingEmployee) {
      return res.status(400).json({
        status: 400,
        message: "Email already exists",
        missingFields: [{ name: "email", message: "This email is already registered" }],
      });
    }

    // Check for duplicate CNIC
    const existingCNIC = await Employee.findOne({ 
      cnic: cnic.trim(), 
      isArchived: false 
    });
    
    if (existingCNIC) {
      return res.status(400).json({
        status: 400,
        message: "CNIC already exists",
        missingFields: [{ name: "cnic", message: "This CNIC is already registered" }],
      });
    }

    // Generate unique employeeId
    const lastEmployee = await Employee.findOne().sort({ createdAt: -1 });
    let newIdNumber = 1;
    if (lastEmployee && lastEmployee.employeeId) {
      const lastNumber = parseInt(lastEmployee.employeeId.split("-")[1]);
      if (!isNaN(lastNumber)) newIdNumber = lastNumber + 1;
    }
    const employeeId = `EMP-${newIdNumber.toString().padStart(4, "0")}`;

    // Create employee
    const employee = await Employee.create({
      employeeId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber.trim(),
      dateOfBirth,
      gender: gender.trim(),
      cnic: cnic.trim(),
      departmentId: departmentId.trim(),
      designationId: designationId.trim(),
      employeementType: employeementType.trim(),
      status: status.trim(),
      salary: parseFloat(salary),
      bankAccountNo: bankAccountNo.trim(),
      address: address.trim(),
      emergencyContactName: emergencyContactName.trim(),
      emergencyContactNo: emergencyContactNo.trim(),
    });
    await logActivity(
  req.user._id,            
  "Employees",            
  "CREATE",              
  null,               
  employee.toObject(),    
  req                    
);


    return res.status(201).json({
      status: 201,
      message: "Employee created successfully",
      data: employee,
    });
  } catch (error) {
    console.error("Create Employee Error:", error);
    return res.status(500).json({
      status: 500,
      message: "Server error while creating employee",
      details: error.message,
    });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      dateOfBirth,
      gender,
      cnic,
      departmentId,
      designationId,
      employeementType,
      status,
      salary,
      bankAccountNo,
      address,
      emergencyContactName,
      emergencyContactNo,
    } = req.body;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        status: 404,
        message: "Employee not found",
      });
    }

    const missingFields = [];

    // Validate First Name
    const firstNameValidation = validateName(firstName, "First Name");
    if (!firstNameValidation.valid) {
      missingFields.push({ name: "firstName", message: firstNameValidation.message });
    }

    // Validate Last Name
    const lastNameValidation = validateName(lastName, "Last Name");
    if (!lastNameValidation.valid) {
      missingFields.push({ name: "lastName", message: lastNameValidation.message });
    }

    // Validate Email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      missingFields.push({ name: "email", message: emailValidation.message });
    }

    // Validate Phone Number
    const phoneValidation = validatePhone(phoneNumber, "Phone Number");
    if (!phoneValidation.valid) {
      missingFields.push({ name: "phoneNumber", message: phoneValidation.message });
    }

    // Validate Date of Birth
    const dobValidation = validateDateOfBirth(dateOfBirth);
    if (!dobValidation.valid) {
      missingFields.push({ name: "dateOfBirth", message: dobValidation.message });
    }

    // Validate Gender
    const genderValidation = validateGender(gender);
    if (!genderValidation.valid) {
      missingFields.push({ name: "gender", message: genderValidation.message });
    }

    // Validate CNIC
    const cnicValidation = validateCNIC(cnic);
    if (!cnicValidation.valid) {
      missingFields.push({ name: "cnic", message: cnicValidation.message });
    }

    // Validate Department
    const deptValidation = validateId(departmentId, "Department");
    if (!deptValidation.valid) {
      missingFields.push({ name: "departmentId", message: deptValidation.message });
    }

    // Validate Designation
    const desigValidation = validateId(designationId, "Designation");
    if (!desigValidation.valid) {
      missingFields.push({ name: "designationId", message: desigValidation.message });
    }

    // Validate Employment Type
    const empTypeValidation = validateEmploymentType(employeementType);
    if (!empTypeValidation.valid) {
      missingFields.push({ name: "employeementType", message: empTypeValidation.message });
    }

    // Validate Status
    const statusValidation = validateStatus(status);
    if (!statusValidation.valid) {
      missingFields.push({ name: "status", message: statusValidation.message });
    }

    // Validate Salary
    const salaryValidation = validateSalary(salary);
    if (!salaryValidation.valid) {
      missingFields.push({ name: "salary", message: salaryValidation.message });
    }

    // Validate Bank Account
    const bankValidation = validateBankAccount(bankAccountNo);
    if (!bankValidation.valid) {
      missingFields.push({ name: "bankAccountNo", message: bankValidation.message });
    }

    // Validate Address
    const addressValidation = validateAddress(address);
    if (!addressValidation.valid) {
      missingFields.push({ name: "address", message: addressValidation.message });
    }

    // Validate Emergency Contact Name
    const emergNameValidation = validateName(emergencyContactName, "Emergency Contact Name");
    if (!emergNameValidation.valid) {
      missingFields.push({ name: "emergencyContactName", message: emergNameValidation.message });
    }

    // Validate Emergency Contact Number
    const emergPhoneValidation = validatePhone(emergencyContactNo, "Emergency Contact Number");
    if (!emergPhoneValidation.valid) {
      missingFields.push({ name: "emergencyContactNo", message: emergPhoneValidation.message });
    }

    // Return all validation errors
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Validation failed. Please correct the errors.",
        missingFields,
      });
    }

    // Check for duplicate email (excluding current employee)
    const existingEmail = await Employee.findOne({ 
      email: email.trim().toLowerCase(), 
      _id: { $ne: id },
      isArchived: false 
    });
    
    if (existingEmail) {
      return res.status(400).json({
        status: 400,
        message: "Email already exists",
        missingFields: [{ name: "email", message: "This email is already registered" }],
      });
    }

    // Check for duplicate CNIC (excluding current employee)
    const existingCNIC = await Employee.findOne({ 
      cnic: cnic.trim(), 
      _id: { $ne: id },
      isArchived: false 
    });
    
    if (existingCNIC) {
      return res.status(400).json({
        status: 400,
        message: "CNIC already exists",
        missingFields: [{ name: "cnic", message: "This CNIC is already registered" }],
      });
    }
    req.oldData = employee.toObject();


    // Update employee
    employee.firstName = firstName.trim();
    employee.lastName = lastName.trim();
    employee.email = email.trim().toLowerCase();
    employee.phoneNumber = phoneNumber.trim();
    employee.dateOfBirth = dateOfBirth;
    employee.gender = gender.trim();
    employee.cnic = cnic.trim();
    employee.departmentId = departmentId.trim();
    employee.designationId = designationId.trim();
    employee.employeementType = employeementType.trim();
    employee.status = status.trim();
    employee.salary = parseFloat(salary);
    employee.bankAccountNo = bankAccountNo.trim();
    employee.address = address.trim();
    employee.emergencyContactName = emergencyContactName.trim();
    employee.emergencyContactNo = emergencyContactNo.trim();

    const updatedEmployee = await employee.save();

    await logActivity(
  req.user._id,
  "Employees",
  "UPDATE",
  req.oldData,
  employee.toObject(),
  req
);


    return res.status(200).json({
      status: 200,
      message: "Employee updated successfully",
      data: updatedEmployee,
    });
  } catch (error) {
    console.error("Update Employee Error:", error);
    return res.status(500).json({
      status: 500,
      message: "Server error while updating employee",
      details: error.message,
    });
  }
};

const getEmployeeList = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const search = req.query.search || ""; 
    
    const filter = {
      isArchived: false,
      $or: [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ],
    };

    const total = await Employee.countDocuments(filter);
    const employees = await Employee.find(filter)
      .populate("departmentId", "departmentName")
      .populate("designationId", "designationName")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    return res.status(200).json({
      message: "Active employees fetched successfully",
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
      data: employees,
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return res.status(500).json({ 
      error: "Server error while fetching employees" 
    });
  }
};

const getArchivedEmployees = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const employees = await Employee.find({ isArchived: true })
      .populate("departmentId", "departmentName")
      .populate("designationId", "designationName")
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Employee.countDocuments({ isArchived: true });

    return res.status(200).json({
      message: "Archived employees fetched",
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: employees,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id)
      .populate("departmentId", "departmentName")
      .populate("designationId", "designationName");

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    return res.status(200).json({
      message: "Employee fetched successfully",
      data: employee,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    req.oldData = employee.toObject();


    employee.isArchived = true;
    await employee.save();

    await logActivity(req.user._id, "Employees", "DELETE", req.oldData, null, req);

    return res.status(200).json({ 
      message: "Employee archived successfully" 
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export {
  createEmployee,
  getEmployeeList,
  getArchivedEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};