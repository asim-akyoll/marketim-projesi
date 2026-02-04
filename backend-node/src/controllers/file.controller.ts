import { Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import multer from "multer";

// Configure Multer to hold file in memory
const storage = multer.memoryStorage();
export const uploadMiddleware = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit matches Java
});

export const uploadFile = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded");
        }

        // Convert buffer to b64 to upload to Cloudinary
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: "marketim"
        });

        // Return URL directly as text/plain to match Java Backend
        res.send(result.secure_url);

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).send("Cloudinary upload failed");
    }
};
