
package com.campusConnect.demo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Transient;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String category;
    private String date;
    private String time;
    private String location;
    private int seats;
    private String icon;
    private String color;

    @Column(length = 2000)
    private String description;

    /** Ticket price in rupees. null or 0 means a free event. */
    private Integer price;

    /** ACTIVE or CANCELLED. null (older rows) is treated as ACTIVE. */
    private String status = "ACTIVE";

    /** The club that owns this event. null means the college/admin. */
    @JsonIgnore
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organizer_id")
    private Organizer organizer;

    /** Seats still free. Calculated, not stored. */
    @Transient
    private Integer seatsLeft;

    @Transient
    private String organizerName;

    @Transient
    private Long organizerId;

    public Event() {
    }

    public Event(Long id, String title, String category, String date,
                 String time, String location, int seats,
                 String icon, String color) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.date = date;
        this.time = time;
        this.location = location;
        this.seats = seats;
        this.icon = icon;
        this.color = color;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public int getSeats() {
        return seats;
    }

    public void setSeats(int seats) {
        this.seats = seats;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getPrice() { return price == null ? 0 : price; }
    public void setPrice(Integer price) { this.price = price; }

    public String getStatus() { return status == null ? "ACTIVE" : status; }
    public void setStatus(String status) { this.status = status; }

    public Organizer getOrganizer() { return organizer; }
    public void setOrganizer(Organizer organizer) { this.organizer = organizer; }

    public Integer getSeatsLeft() { return seatsLeft; }
    public void setSeatsLeft(Integer seatsLeft) { this.seatsLeft = seatsLeft; }

    public String getOrganizerName() { return organizerName; }
    public void setOrganizerName(String organizerName) { this.organizerName = organizerName; }

    public Long getOrganizerId() { return organizerId; }
    public void setOrganizerId(Long organizerId) { this.organizerId = organizerId; }
}
