package com.marketim.backend.user;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ DB: first_name
    @Column(name = "first_name", nullable = false)
    private String firstName;

    // ✅ DB: last_name
    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;

    private String phone;

    @Column(length = 500)
    private String address;

    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    // ✅ admin müşteriyi kapatabilsin
    @Builder.Default
    private boolean active = true;

    // ✅ DB: created_at
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // ---------- UserDetails ----------
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }

    // ✅ artık active alanına bağladık
    @Override
    public boolean isEnabled() {
        return active;
    }

    // UI için pratik
    @Transient
    public String getFullName() {
        return ((firstName == null ? "" : firstName) + " " +
                (lastName == null ? "" : lastName)).trim();
    }
}
