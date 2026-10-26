
package com.campusConnect.demo;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "event_registrations",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "unique_student_event",
            columnNames = {"student_id", "event_id"}
        )
    }
)
public class Registration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    private LocalDateTime registeredAt;

    private String status = "CONFIRMED";

    public Registration() {
    }

    @PrePersist
    public void beforeSave() {
        if (registeredAt == null) {
            registeredAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public LocalDateTime getRegisteredAt() {
        return registeredAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
