package com.campusConnect.demo;

import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/** Separate login endpoints for the admin and for club organizers. */
@RestController
@RequestMapping("/api")
public class StaffAuthController {

    private final AdminRepository adminRepository;
    private final OrganizerRepository organizerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public StaffAuthController(
            AdminRepository adminRepository,
            OrganizerRepository organizerRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.adminRepository = adminRepository;
        this.organizerRepository = organizerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    private ResponseStatusException badLogin() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                "Invalid username or password");
    }

    // ---------------- Admin ----------------

    @PostMapping("/admin/auth/login")
    public Map<String, Object> adminLogin(
            @Valid @RequestBody StaffLoginRequest request) {

        String email = request.getUsername().trim().toLowerCase(Locale.ROOT);

        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(this::badLogin);

        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw badLogin();
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("token", jwtService.generateAdminToken(admin));
        response.put("name", admin.getName());
        response.put("email", admin.getEmail());
        response.put("role", "ADMIN");
        return response;
    }

    @GetMapping("/admin/auth/me")
    public Map<String, Object> adminMe(Authentication authentication) {
        Admin admin = adminRepository.findByEmail(authentication.getName())
                .orElseThrow(this::badLogin);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("name", admin.getName());
        response.put("email", admin.getEmail());
        response.put("role", "ADMIN");
        return response;
    }

    // ---------------- Organizer ----------------

    @PostMapping("/organizer/auth/login")
    public Map<String, Object> organizerLogin(
            @Valid @RequestBody StaffLoginRequest request) {

        String loginId = request.getUsername().trim().toLowerCase(Locale.ROOT);

        Organizer organizer = organizerRepository.findByLoginId(loginId)
                .orElseThrow(this::badLogin);

        if (!passwordEncoder.matches(
                request.getPassword(), organizer.getPassword())) {
            throw badLogin();
        }

        if (!organizer.isActive()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "This club account has been deactivated. "
                            + "Please contact the college admin.");
        }

        return organizerSession(organizer);
    }

    @GetMapping("/organizer/auth/me")
    public Map<String, Object> organizerMe(Authentication authentication) {
        Organizer organizer = organizerRepository
                .findByLoginId(authentication.getName())
                .orElseThrow(this::badLogin);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("clubName", organizer.getClubName());
        response.put("loginId", organizer.getLoginId());
        response.put("mustChangePassword", organizer.isMustChangePassword());
        response.put("role", "ORGANIZER");
        return response;
    }

    /** Forced on first login; also usable any time afterwards. */
    @PostMapping("/organizer/auth/change-password")
    public Map<String, Object> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {

        Organizer organizer = organizerRepository
                .findByLoginId(authentication.getName())
                .orElseThrow(this::badLogin);

        if (!passwordEncoder.matches(
                request.getCurrentPassword(), organizer.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Current password is incorrect.");
        }

        if (request.getCurrentPassword().equals(request.getNewPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Choose a new password different from the current one.");
        }

        organizer.setPassword(passwordEncoder.encode(request.getNewPassword()));
        organizer.setMustChangePassword(false);
        organizerRepository.save(organizer);

        // New token without the "must change" restriction.
        return organizerSession(organizer);
    }

    private Map<String, Object> organizerSession(Organizer organizer) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("token", jwtService.generateOrganizerToken(organizer));
        response.put("clubName", organizer.getClubName());
        response.put("loginId", organizer.getLoginId());
        response.put("mustChangePassword", organizer.isMustChangePassword());
        response.put("role", "ORGANIZER");
        return response;
    }
}
