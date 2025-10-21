require('dotenv').config();
const express=require("express");
const app= express();
const cors = require("cors");
const connectDB= require("./utils/db");
const employeeRouter=require('./Routes/employeeRouter');
const departmentRouter=require('./Routes/departmentRouter');
const designationRouter = require('./Routes/designationRouter');
const attendanceRouter = require('./Routes/attendanceRouter');
const leaveRouter = require('./Routes/leaveRouter');
const jobRouter = require('./Routes/jobRouter');
const applicationRouter = require('./Routes/applicationRouter');
const payrollRouter = require('./Routes/payrollRouter');
const performanceRouter = require('./Routes/performanceRouter');
const trainingRouter = require('./Routes/trainingRouter');
const userRouter = require('./Routes/userRouter');
const roleRouter = require('./Routes/rolesRouter');

const port = process.env.PORT || 5009;

 
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use("/employees" , employeeRouter);
app.use("/departments", departmentRouter);
app.use("/designations", designationRouter);
app.use("/attendance", attendanceRouter);
app.use("/leaves", leaveRouter);
app.use("/jobs", jobRouter);
app.use("/applications", applicationRouter);
app.use("/payroll", payrollRouter);
app.use("/performance", performanceRouter);
app.use("/training", trainingRouter);
app.use("/users", userRouter);
app.use("/roles", roleRouter);
app.use("/fines", require("./Routes/fineRouter"));
 
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on Port: ${port}`);
  });
});
