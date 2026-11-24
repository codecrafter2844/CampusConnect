
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

    /** CONFIRMED, PENDING_PAYMENT or CANCELLED. */
    private String status = "CONFIRMED";

    /** NOT_REQUIRED, PENDING, PAID, REFUND_PENDING or REFUNDED. */
    private String paymentStatus = "NOT_REQUIRED";

    /** Amount in rupees charged for this registration. */
    private Integer amount = 0;

    private String razorpayOrderId;
    private String razorpayPaymentId;
    private LocalDateTime paidAt;

    @Column(length = 500)
    private String cancelReason;
    private LocalDateTime cancelledAt;

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

    public void setRegisteredAt(LocalDateTime registeredAt) {
    this.registeredAt = registeredAt;
}

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPaymentStatus() { return paymentStatus == null ? "NOT_REQUIRED" : paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public Integer getAmount() { return amount == null ? 0 : amount; }
    public void setAmount(Integer amount) { this.amount = amount; }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }

    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }

    public String getCancelReason() { return cancelReason; }
    public void setCancelReason(String cancelReason) { this.cancelReason = cancelReason; }

    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }
}
