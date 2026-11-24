package com.campusConnect.demo;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/** A college club's login. Created only by the admin. */
@Entity
@Table(name = "organizers")
public class Organizer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String clubName;

    /** Generated login ID, e.g. "codingclub-4821". */
    @Column(nullable = false, unique = true)
    private String loginId;

    /** Optional contact email of the club (not used for login). */
    private String contactEmail;

    @Column(nullable = false)
    private String password;

    private boolean mustChangePassword = true;
    private boolean active = true;
    private LocalDateTime createdAt;

    public Organizer() {
    }

    @PrePersist
    public void beforeSave() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getClubName() { return clubName; }
    public void setClubName(String clubName) { this.clubName = clubName; }
    public String getLoginId() { return loginId; }
    public void setLoginId(String loginId) { this.loginId = loginId; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public boolean isMustChangePassword() { return mustChangePassword; }
    public void setMustChangePassword(boolean mustChangePassword) { this.mustChangePassword = mustChangePassword; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
