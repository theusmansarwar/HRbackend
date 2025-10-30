import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./utils/db.js";

import employeeRouter from "./Routes/employeeRouter.js";
import departmentRouter from "./Routes/departmentRouter.js";
import designationRouter from "./Routes/designationRouter.js";
import attendanceRouter from "./Routes/attendanceRouter.js";
import leaveRouter from "./Routes/leaveRouter.js";
import jobRouter from "./Routes/jobRouter.js";
import reportsRouter from "./Routes/reportsRouter.js";
import applicationRouter from "./Routes/applicationRouter.js";
import payrollRouter from "./Routes/payrollRouter.js";
import performanceRouter from "./Routes/performanceRouter.js";
import trainingRouter from "./Routes/trainingRouter.js";
import userRouter from "./Routes/userRouter.js";
import roleRouter from "./Routes/rolesRouter.js";
import fineRouter from "./Routes/fineRouter.js";
import activityRouter from "./Routes/activityRouter.js"


const app = express();
const port = process.env.PORT || 5009;

app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Routes
app.use("/employees", employeeRouter);
app.use("/departments", departmentRouter);
app.use("/designations", designationRouter);
app.use("/attendance", attendanceRouter);
app.use("/leaves", leaveRouter);
app.use("/jobs", jobRouter);
app.use("/applications", applicationRouter);
app.use("/payroll", payrollRouter);
app.use("/performance", performanceRouter);
app.use("/training", trainingRouter);
app.use("/reports", reportsRouter);
app.use("/users", userRouter);
app.use("/roles", roleRouter);
app.use("/fines", fineRouter);
app.use("/activities",activityRouter)

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on Port: ${port}`);
  });
});
