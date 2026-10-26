
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
    private final EventRepository eventRepository;
    private final StudentRepository studentRepository;

    public RegistrationController(
            RegistrationRepository registrationRepository,
            EventRepository eventRepository,
            StudentRepository studentRepository) {
        this.registrationRepository = registrationRepository;
        this.eventRepository = eventRepository;
        this.studentRepository = studentRepository;
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

        Optional<Event> eventOptional = eventRepository.findById(eventId);

        if (eventOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Event not found."));
        }

        Student student = studentOptional.get();
        Event event = eventOptional.get();

        if (registrationRepository.existsByStudentIdAndEventId(
                student.getId(), event.getId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message",
                            "You are already registered for this event."
                    ));
        }

        Registration registration = new Registration();
        registration.setStudent(student);
        registration.setEvent(event);
        registration.setStatus("CONFIRMED");

        Registration saved =
                registrationRepository.save(registration);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Registration successful!");
        response.put("registrationId", saved.getId());
        response.put("eventId", event.getId());
        response.put("eventTitle", event.getTitle());
        response.put("status", saved.getStatus());
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
                    item.put("registeredAt",
                            registration.getRegisteredAt());

                    return item;
                })
                .toList();

        return ResponseEntity.ok(response);
    }
}
