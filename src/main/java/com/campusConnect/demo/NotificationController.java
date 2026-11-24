package com.campusConnect.demo;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/** In-app notifications for students (e.g. event cancelled). */
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final StudentRepository studentRepository;

    public NotificationController(
            NotificationRepository notificationRepository,
            StudentRepository studentRepository) {
        this.notificationRepository = notificationRepository;
        this.studentRepository = studentRepository;
    }

    private Student student(Authentication authentication) {
        return studentRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Student account not found."));
    }

    @GetMapping
    public Map<String, Object> list(Authentication authentication) {
        Student student = student(authentication);

        List<Map<String, Object>> items = notificationRepository
                .findByStudentIdOrderByCreatedAtDesc(student.getId())
                .stream()
                .map(n -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("id", n.getId());
                    item.put("message", n.getMessage());
                    item.put("seen", n.isSeen());
                    item.put("createdAt", n.getCreatedAt());
                    return item;
                })
                .toList();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("unread", items.stream()
                .filter(i -> !(Boolean) i.get("seen")).count());
        response.put("items", items);
        return response;
    }

    @PostMapping("/read-all")
    @Transactional
    public Map<String, Object> readAll(Authentication authentication) {
        Student student = student(authentication);

        notificationRepository
                .findByStudentIdOrderByCreatedAtDesc(student.getId())
                .forEach(n -> {
                    if (!n.isSeen()) {
                        n.setSeen(true);
                        notificationRepository.save(n);
                    }
                });

        return Map.of("message", "All notifications marked as read.");
    }
}
