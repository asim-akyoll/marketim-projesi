package com.marketim.backend.user;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository
                .findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    // ✅ Eski kullanım (3 parametre) - BOZULMASIN
    public User registerUser(String fullName, String email, String password) {
        return registerUser(fullName, email, password, null);
    }

    // ✅ Yeni kullanım (4 parametre) - fullName'i firstName/lastName'e çeviriyoruz
    public User registerUser(String fullName, String email, String password, String phone) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already in use");
        }

        String[] names = splitName(fullName);
        String fn = names[0];
        String ln = names[1];

        User user = User.builder()
                .firstName(fn)
                .lastName(ln)
                .email(email)
                .phone(phone)
                .password(passwordEncoder.encode(password))
                .role(Role.ROLE_USER)
                .active(true)
                .build();

        return userRepository.save(user);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    public User updateProfile(String email, String fullName, String phone, String address) {
        User user = getUserByEmail(email);

        if (fullName != null && !fullName.isBlank()) {
            String[] names = splitName(fullName);
            user.setFirstName(names[0]);
            user.setLastName(names[1]);
        }
        
        if (phone != null) user.setPhone(phone);
        if (address != null) user.setAddress(address);

        return userRepository.save(user);
    }

    private String[] splitName(String fullName) {
         String fn = "User";
         String ln = "";
         
         if (fullName != null) {
            String trimmed = fullName.trim();
            if (!trimmed.isEmpty()) {
                String[] parts = trimmed.split("\\s+");
                fn = parts[0];
                if (parts.length > 1) {
                    ln = String.join(" ", java.util.Arrays.copyOfRange(parts, 1, parts.length));
                }
            }
        }
        return new String[]{fn, ln};
    }


}


