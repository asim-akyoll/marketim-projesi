package com.marketim.backend.auth;

import com.marketim.backend.config.JwtService;
import com.marketim.backend.user.User;
import com.marketim.backend.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService; // register için kalsın
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        User user = userService.registerUser(
                request.getFullName(),
                request.getEmail(),
                request.getPassword(),
                request.getPhone()
        );

        return ResponseEntity.ok(new AuthResponse("User registered with id: " + user.getId()));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        String token = jwtService.generateToken(authentication);

        return ResponseEntity.ok(new LoginResponse(token));
    }
}
