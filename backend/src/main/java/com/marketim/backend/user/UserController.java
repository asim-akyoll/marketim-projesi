package com.marketim.backend.user;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ProfileDto> getMe(Authentication auth) {
        User user = userService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(new ProfileDto(
            user.getFullName(),
            user.getPhone(),
            user.getAddress()
        ));
    }

    @PutMapping("/me")
    public ResponseEntity<ProfileDto> updateMe(Authentication auth, @RequestBody ProfileUpdateDto request) {
        User updated = userService.updateProfile(
            auth.getName(),
            request.getFullName(),
            request.getPhone(),
            request.getAddress()
        );
        return ResponseEntity.ok(new ProfileDto(
            updated.getFullName(),
            updated.getPhone(),
            updated.getAddress()
        ));
    }

    // DTOs
    @lombok.Data
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    public static class ProfileDto {
        private String fullName;
        private String phone;
        private String address;
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    public static class ProfileUpdateDto {
        private String fullName;
        private String phone;
        private String address;
    }
}
