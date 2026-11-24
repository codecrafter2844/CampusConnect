package com.campusConnect.demo;

import java.util.LinkedHashMap;
import java.util.Map;

/** Small helpers that turn entities into JSON-friendly maps. */
final class Views {

    private Views() {
    }

    /** A registration as seen by organizers and admin. */
    static Map<String, Object> registrationRow(Registration r) {
        Map<String, Object> item = new LinkedHashMap<>();
        Event event = r.getEvent();
        Student student = r.getStudent();

        item.put("registrationId", r.getId());
        item.put("eventId", event.getId());
        item.put("eventTitle", event.getTitle());
        item.put("clubName", event.getOrganizer() == null
                ? "College" : event.getOrganizer().getClubName());
        item.put("studentName", student.getName());
        item.put("studentEmail", student.getEmail());
        item.put("status", r.getStatus());
        item.put("paymentStatus", r.getPaymentStatus());
        item.put("amount", r.getAmount());
        item.put("razorpayPaymentId", r.getRazorpayPaymentId());
        item.put("registeredAt", r.getRegisteredAt());
        item.put("paidAt", r.getPaidAt());
        item.put("cancelReason", r.getCancelReason());
        return item;
    }

    static Map<String, Object> organizerRow(Organizer o, long eventCount) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", o.getId());
        item.put("clubName", o.getClubName());
        item.put("loginId", o.getLoginId());
        item.put("contactEmail", o.getContactEmail());
        item.put("active", o.isActive());
        item.put("mustChangePassword", o.isMustChangePassword());
        item.put("createdAt", o.getCreatedAt());
        item.put("eventCount", eventCount);
        return item;
    }
}
