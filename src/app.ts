import express, { Request, Response } from "express";
import { identify } from "./controller/identify.controller";

const app = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Server is running"
    });
});

app.post("/identify", identify);


export default app;