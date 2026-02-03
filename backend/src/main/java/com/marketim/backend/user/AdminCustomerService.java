package com.marketim.backend.user;

import com.marketim.backend.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminCustomerService {

    private final UserRepository userRepository;

    public Page<AdminCustomerResponse> search(String q, Boolean active, Pageable pageable) {

        // ✅ q boş/blank gelirse null yap (DB query stabil olsun)
        if (q != null) {
            q = q.trim();
            if (q.isEmpty()) q = null;
        }

        return userRepository
                .searchCustomers(Role.ROLE_USER.name(), q, active, pageable)
                .map(this::toResponse);
    }


    @Transactional
    public AdminCustomerResponse toggleActive(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id " + id));

        // admin'i yanlışlıkla kapatma koruması (id ile çağırsa bile)
        if (user.getRole() == Role.ROLE_ADMIN) {
            throw new com.marketim.backend.exception.BadRequestException("Admin user cannot be toggled");
        }

        user.setActive(!user.isActive());
        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    private AdminCustomerResponse toResponse(User u) {
        return AdminCustomerResponse.builder()
                .id(u.getId())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .address(u.getAddress())
                .active(u.isActive())
                .createdAt(u.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public AdminCustomerResponse getById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id " + id));

        if (user.getRole() != Role.ROLE_USER) {
            throw new NotFoundException("Customer not found with id " + id);
        }

        return toResponse(user);
    }

}
