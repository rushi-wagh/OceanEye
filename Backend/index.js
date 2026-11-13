import express from "express";  
import cors from "cors";    
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDb } from "./src/utils/db.js";
import authRouter from "./src/routes/auth.route.js";
import dashboardRouter from "./src/routes/dashboard.route.js";
import reportRouter from "./src/routes/report.route.js";
import userRouter from "./src/routes/user.route.js";
import { errorHandler, notFound } from "./src/middlewares/error.middleware.js";

dotenv.config();

const app = express();
const frontendOrigin = process.env.FRONTEND_URL?.trim().replace(/\/$/, "");

app.use(cors({
  origin: frontendOrigin,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

app.use("/api/auth", authRouter);
app.use("/api/reports", reportRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/users", userRouter);

app.use(notFound);
app.use(errorHandler);

// start the server only when db is connected
connectDb().then(() => {
  app.listen(process.env.PORT || 8080, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
});
