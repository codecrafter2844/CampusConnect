package com.campusConnect.demo;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Admin creates a club login. Only the name is needed; the rest is generated. */
public class OrganizerRequest {

    @NotBlank(message = "Club name is required")
    @Size(max = 100, message = "Club name is too long")
    private String clubName;

    @Email(message = "Enter a valid contact email")
    private String contactEmail;

    public String getClubName() { return clubName; }
    public void setClubName(String clubName) { this.clubName = clubName; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
}
