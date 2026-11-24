package com.campusConnect.demo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Creates the one college admin account on first startup, using
 * ADMIN_EMAIL / ADMIN_PASSWORD (and optionally ADMIN_NAME) from .env.
 * If an admin already exists nothing is changed.
 */
@Component
public class AdminSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String password;
    private final String name;

    public AdminSeeder(
            AdminRepository adminRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.email:}") String email,
            @Value("${app.admin.password:}") String password,
            @Value("${app.admin.name:College Admin}") String name) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.email = email;
        this.password = password;
        this.name = name;
    }

    @Override
    public void run(String... args) {
        if (adminRepository.count() > 0) {
            return;
        }

        if (email == null || email.isBlank()
                || password == null || password.length() < 8) {
            log.warn("No admin exists yet. Set ADMIN_EMAIL and ADMIN_PASSWORD "
                    + "(min 8 characters) in .env and restart to create one.");
            return;
        }

        adminRepository.save(new Admin(
                name.trim(),
                email.trim().toLowerCase(java.util.Locale.ROOT),
                passwordEncoder.encode(password)));

        log.info("Seeded admin account for {}", email);
    }
}
