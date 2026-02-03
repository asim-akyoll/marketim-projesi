package com.marketim.backend.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class AdminCustomerResponse {

    private Long id;

    private String firstName;
    private String lastName;
    private String fullName;

    private String email;
    private String phone;
    private String address;

    private boolean active;

    private LocalDateTime createdAt;
}

