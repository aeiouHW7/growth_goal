import express from "express";
import cors from "cors";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import userRoutes from "./routes/user";
import goalRoutes from "./routes/goals";
import planRoutes from "./routes/plans";
import reviewRoutes from "./routes/reviews";
import analysisRoutes from "./routes/analysis";
import progressRoutes from "./routes/progress";

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/api/user", userRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/progress", progressRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
