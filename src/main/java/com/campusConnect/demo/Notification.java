package com.campusConnect.demo;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/** An in-app message for a student (e.g. an event was cancelled). */
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false, length = 600)
    private String message;

    private boolean seen = false;
    private LocalDateTime createdAt;

    public Notification() {
    }

    public Notification(Student student, String message) {
        this.student = student;
        this.message = message;
    }

    @PrePersist
    public void beforeSave() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Student getStudent() { return student; }
    public String getMessage() { return message; }
    public boolean isSeen() { return seen; }
    public void setSeen(boolean seen) { this.seen = seen; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
