package com.campusConnect.demo;

import java.security.SecureRandom;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/** College admin: club accounts, all events, all registrations and payments. */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final String PASSWORD_ALPHABET =
            "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    private final SecureRandom random = new SecureRandom();

    private final OrganizerRepository organizerRepository;
    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final StudentRepository studentRepository;
    private final EventService eventService;
    private final PasswordEncoder passwordEncoder;

    public AdminController(
            OrganizerRepository organizerRepository,
            EventRepository eventRepository,
            RegistrationRepository registrationRepository,
            StudentRepository studentRepository,
            EventService eventService,
            PasswordEncoder passwordEncoder) {
        this.organizerRepository = organizerRepository;
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.studentRepository = studentRepository;
        this.eventService = eventService;
        this.passwordEncoder = passwordEncoder;
    }

    // ---------------- Overview ----------------

    @GetMapping("/summary")
    public Map<String, Object> summary() {
        eventService.releaseExpiredHolds();

        long revenue = 0;
        long paidCount = 0;
        long refundPending = 0;
        long refundPendingAmount = 0;
        long confirmed = 0;

        for (Registration r : registrationRepository.findAll()) {
            if ("CONFIRMED".equals(r.getStatus())) confirmed++;
            if ("PAID".equals(r.getPaymentStatus())) {
                paidCount++;
                revenue += r.getAmount();
            }
            if ("REFUND_PENDING".equals(r.getPaymentStatus())) {
                refundPending++;
                refundPendingAmount += r.getAmount();
            }
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("students", studentRepository.count());
        response.put("organizers", organizerRepository.count());
        response.put("events", eventRepository.findActiveForAdmin().size());
        response.put("registrations", confirmed);
        response.put("paidRegistrations", paidCount);
        response.put("revenue", revenue);
        response.put("refundsPending", refundPending);
        response.put("refundsPendingAmount", refundPendingAmount);
        return response;
    }

    // ---------------- Organizer accounts ----------------

    @GetMapping("/organizers")
    public List<Map<String, Object>> organizers() {
        return organizerRepository.findAll().stream()
                .map(o -> Views.organizerRow(
                        o, eventRepository.countByOrganizerId(o.getId())))
                .toList();
    }

    /**
     * Creates a club login. The system generates the login ID and a
     * temporary password; the password is shown once and the club must
     * change it at first login.
     */
    @PostMapping("/organizers")
    @Transactional
    public Map<String, Object> createOrganizer(
            @Valid @RequestBody OrganizerRequest request) {

        String clubName = request.getClubName().trim();

        Organizer organizer = new Organizer();
        organizer.setClubName(clubName);
        organizer.setContactEmail(
                request.getContactEmail() == null
                        || request.getContactEmail().isBlank()
                        ? null : request.getContactEmail().trim());
        organizer.setLoginId(generateLoginId(clubName));

        String temporaryPassword = generatePassword();
        organizer.setPassword(passwordEncoder.encode(temporaryPassword));
        organizer.setMustChangePassword(true);
        organizer.setActive(true);

        Organizer saved = organizerRepository.save(organizer);

        Map<String, Object> response = Views.organizerRow(saved, 0);
        response.put("temporaryPassword", temporaryPassword);
        response.put("message",
                "Club account created. Share these credentials with the club - "
                        + "the password is only shown now.");
        return response;
    }

    @PostMapping("/organizers/{id}/reset-password")
    @Transactional
    public Map<String, Object> resetPassword(@PathVariable Long id) {
        Organizer organizer = organizerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Club account not found."));

        String temporaryPassword = generatePassword();
        organizer.setPassword(passwordEncoder.encode(temporaryPassword));
        organizer.setMustChangePassword(true);
        organizerRepository.save(organizer);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("loginId", organizer.getLoginId());
        response.put("clubName", organizer.getClubName());
        response.put("temporaryPassword", temporaryPassword);
        response.put("message",
                "Password reset. The club must change it at next login.");
        return response;
    }

    @PutMapping("/organizers/{id}/active")
    @Transactional
    public Map<String, Object> setActive(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {

        Organizer organizer = organizerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Club account not found."));

        boolean active = Boolean.TRUE.equals(body.get("active"));
        organizer.setActive(active);
        organizerRepository.save(organizer);

        return Views.organizerRow(
                organizer, eventRepository.countByOrganizerId(id));
    }

    private String generateLoginId(String clubName) {
        String slug = clubName.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]", "");
        if (slug.isEmpty()) slug = "club";
        if (slug.length() > 12) slug = slug.substring(0, 12);

        String candidate;
        do {
            candidate = slug + "-" + (1000 + random.nextInt(9000));
        } while (organizerRepository.existsByLoginId(candidate));
        return candidate;
    }

    private String generatePassword() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 10; i++) {
            sb.append(PASSWORD_ALPHABET.charAt(
                    random.nextInt(PASSWORD_ALPHABET.length())));
        }
        return sb.toString();
    }

    // ---------------- Events (all clubs) ----------------

    @GetMapping("/events")
    public List<Map<String, Object>> events() {
        return eventService.dashboardEvents(eventRepository.findAllActive());
    }

    @PostMapping("/events")
    public Map<String, Object> createEvent(
            @Valid @RequestBody EventRequest request) {
        Organizer owner = eventService.resolveOrganizer(request.getOrganizerId());
        Event event = eventService.create(request, owner);
        return eventService.dashboardEvents(List.of(event)).get(0);
    }

    @PutMapping("/events/{id}")
    public Map<String, Object> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventRequest request) {
        Event event = eventService.update(id, request, null);
        return eventService.dashboardEvents(List.of(event)).get(0);
    }

    @DeleteMapping("/events/{id}")
    public Map<String, Object> deleteEvent(@PathVariable Long id) {
        return eventService.deleteEvent(id, null);
    }

    // ---------------- Registrations and payments ----------------

    @GetMapping("/registrations")
    public List<Map<String, Object>> registrations(
            @RequestParam(required = false) Long eventId) {

        eventService.releaseExpiredHolds();

        List<Registration> list = eventId == null
                ? registrationRepository.findAllByOrderByRegisteredAtDesc()
                : registrationRepository
                        .findByEventIdOrderByRegisteredAtDesc(eventId);

        return list.stream().map(Views::registrationRow).toList();
    }

    @PostMapping("/registrations/{id}/refunded")
    public Map<String, Object> markRefunded(@PathVariable Long id) {
        return Views.registrationRow(eventService.markRefunded(id, null));
    }
}
