package com.campusConnect.demo;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    private final RegistrationRepository registrationRepository;
    private final StudentRepository studentRepository;
    private final RegistrationService registrationService;
    private final EventService eventService;

    public RegistrationController(
            RegistrationRepository registrationRepository,
            StudentRepository studentRepository,
            RegistrationService registrationService,
            EventService eventService) {
        this.registrationRepository = registrationRepository;
        this.studentRepository = studentRepository;
        this.registrationService = registrationService;
        this.eventService = eventService;
    }

    @PostMapping("/{eventId}")
    public ResponseEntity<?> registerForEvent(
            @PathVariable Long eventId,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Please log in first."));
        }

        Optional<Student> studentOptional =
                studentRepository.findByEmail(authentication.getName());

        if (studentOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Student account not found."));
        }

        // Throws 404 / 409 / 410 with a readable message when it cannot register.
        Registration saved =
                registrationService.register(studentOptional.get(), eventId);

        boolean needsPayment = "PENDING_PAYMENT".equals(saved.getStatus());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", needsPayment
                ? "Seat held. Complete the payment to confirm your registration."
                : "Registration successful!");
        response.put("registrationId", saved.getId());
        response.put("eventId", saved.getEvent().getId());
        response.put("eventTitle", saved.getEvent().getTitle());
        response.put("status", saved.getStatus());
        response.put("paymentStatus", saved.getPaymentStatus());
        response.put("amount", saved.getAmount());
        response.put("requiresPayment", needsPayment);
        response.put("registeredAt", saved.getRegisteredAt());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyRegistrations(
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Please log in first."));
        }

        Optional<Student> studentOptional =
                studentRepository.findByEmail(authentication.getName());

        if (studentOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Student account not found."));
        }

        eventService.releaseExpiredHolds();

        List<Registration> registrations =
                registrationRepository.findByStudentId(
                        studentOptional.get().getId());

        List<Map<String, Object>> response = registrations.stream()
                .map(registration -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    Event event = registration.getEvent();

                    item.put("registrationId", registration.getId());
                    item.put("eventId", event.getId());
                    item.put("title", event.getTitle());
                    item.put("category", event.getCategory());
                    item.put("date", event.getDate());
                    item.put("time", event.getTime());
                    item.put("location", event.getLocation());
                    item.put("status", registration.getStatus());
                    item.put("paymentStatus", registration.getPaymentStatus());
                    item.put("amount", registration.getAmount());
                    item.put("cancelReason", registration.getCancelReason());
                    item.put("registeredAt",
                            registration.getRegisteredAt());

                    return item;
                })
                .toList();

        return ResponseEntity.ok(response);
    }
}
