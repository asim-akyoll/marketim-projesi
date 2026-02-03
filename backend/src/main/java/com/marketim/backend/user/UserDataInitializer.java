package com.marketim.backend.user;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByEmail("admin")) {
            User admin = User.builder()
                    .firstName("Admin")
                    .lastName("User")
                    .email("admin")
                    .phone("5550000000")
                    .password(passwordEncoder.encode("admin"))
                    .role(Role.ROLE_ADMIN)
                    .active(true)
                    .build();

            userRepository.save(admin);
            System.out.println("--- ADMIN USER CREATED: admin / admin ---");
        }
    }
}
