package com.marketim.backend.exception;

import lombok.*;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponse {
    private LocalDateTime timestamp;
    private int status;
    private String error;     // NOT_FOUND, BAD_REQUEST, FORBIDDEN...
    private String message;   // human readable
    private String path;      // /api/...
    private Map<String, String> validationErrors; // field -> message (optional)
}

