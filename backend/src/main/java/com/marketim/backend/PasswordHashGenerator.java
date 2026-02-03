package com.marketim.backend;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        String raw = "123456";
        String hashFromDb = "$2a$10$/1v/dqbD3E3G93l1eWFCx.LARl2XOgQ8faGoyDlMMFhb6lkiksJ5S";

        System.out.println("DB matches? " + encoder.matches(raw, hashFromDb));
    }
}

