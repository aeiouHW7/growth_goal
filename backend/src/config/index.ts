import dotenv from "dotenv";
dotenv.config({ path: require("path").resolve(__dirname, "../.env") });

export const config = {
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: process.env.NODE_ENV || "development",
};
