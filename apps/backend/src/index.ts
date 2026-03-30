import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectRedis } from "./lib/redis.js";
import userRouter from "./routes/users.js";


const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use("/api/users", userRouter);


app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

const start = async (): Promise<void> => {
    await connectRedis();
    const PORT = process.env.PORT ?? 3001;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

start();

export default app;