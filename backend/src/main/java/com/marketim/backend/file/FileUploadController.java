package com.marketim.backend.file;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    private final com.cloudinary.Cloudinary cloudinary;

    public FileUploadController(com.cloudinary.Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    @PostMapping
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), com.cloudinary.utils.ObjectUtils.emptyMap());
            String url = (String) uploadResult.get("url");
            // Ensure https
            if (url != null && url.startsWith("http://")) {
                url = url.replace("http://", "https://");
            }
            return ResponseEntity.ok(url);
        } catch (IOException ex) {
            return ResponseEntity.internalServerError().body("Cloudinary upload failed: " + ex.getMessage());
        }
    }
}
