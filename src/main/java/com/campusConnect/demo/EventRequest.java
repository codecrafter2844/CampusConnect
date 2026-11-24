package com.campusConnect.demo;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Body for creating or editing an event. */
public class EventRequest {

    @NotBlank(message = "Event title is required")
    @Size(max = 150, message = "Title is too long")
    private String title;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Date is required")
    private String date;

    @NotBlank(message = "Time is required")
    private String time;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Seats is required")
    @Min(value = 1, message = "Seats must be at least 1")
    private Integer seats;

    @Min(value = 0, message = "Price cannot be negative")
    private Integer price = 0;

    @Size(max = 2000, message = "Description is too long")
    private String description;

    private String icon;
    private String color;

    /** Admin only: which club owns the event (null = college). */
    private Long organizerId;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public Integer getSeats() { return seats; }
    public void setSeats(Integer seats) { this.seats = seats; }
    public Integer getPrice() { return price; }
    public void setPrice(Integer price) { this.price = price; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public Long getOrganizerId() { return organizerId; }
    public void setOrganizerId(Long organizerId) { this.organizerId = organizerId; }
}
