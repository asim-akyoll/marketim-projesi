import { Router } from "express";
import { uploadFile, uploadMiddleware } from "../controllers/file.controller";

const router = Router();

router.post("/", uploadMiddleware.single("file"), uploadFile);

export default router;
