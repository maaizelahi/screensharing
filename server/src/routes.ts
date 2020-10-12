import express, { Request, Response } from "express";
import { generateScreenId } from "./helper";

const router = express.Router();

router.get("/screenId", async (req: Request, res: Response) => {
    const screenId = generateScreenId();
    res.send(screenId);
});

export { router as screenRouter };
