package com.campusConnect.demo;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/** A club's own dashboard: its events, registrations and payments. */
@RestController
@RequestMapping("/api/organizer")
public class OrganizerController {

    private final OrganizerRepository organizerRepository;
    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final EventService eventService;

    public OrganizerController(
            OrganizerRepository organizerRepository,
            EventRepository eventRepository,
            RegistrationRepository registrationRepository,
            EventService eventService) {
        this.organizerRepository = organizerRepository;
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.eventService = eventService;
    }

    /** Loads the signed-in club and re-checks it is still allowed in. */
    private Organizer current(Authentication authentication) {
        Organizer organizer = organizerRepository
                .findByLoginId(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Please log in again."));

        if (!organizer.isActive()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "This club account has been deactivated.");
        }
        if (organizer.isMustChangePassword()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Please change your temporary password first.");
        }
        return organizer;
    }

    @GetMapping("/summary")
    public Map<String, Object> summary(Authentication authentication) {
        Organizer organizer = current(authentication);

        List<Map<String, Object>> events = eventService.dashboardEvents(
                eventRepository.findActiveByOrganizerId(organizer.getId()));

        long registered = 0, paid = 0, revenue = 0, refunds = 0;
        for (Map<String, Object> e : events) {
            registered += (Long) e.get("registered");
            paid += (Long) e.get("paid");
            revenue += (Long) e.get("revenue");
            refunds += (Long) e.get("refundPending");
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("clubName", organizer.getClubName());
        response.put("events", events.size());
        response.put("registrations", registered);
        response.put("paidRegistrations", paid);
        response.put("revenue", revenue);
        response.put("refundsPending", refunds);
        return response;
    }

    @GetMapping("/events")
    public List<Map<String, Object>> events(Authentication authentication) {
        Organizer organizer = current(authentication);
        return eventService.dashboardEvents(
                eventRepository.findActiveByOrganizerId(organizer.getId()));
    }

    @PostMapping("/events")
    public Map<String, Object> createEvent(
            @Valid @RequestBody EventRequest request,
            Authentication authentication) {
        Organizer organizer = current(authentication);
        Event event = eventService.create(request, organizer);
        return eventService.dashboardEvents(List.of(event)).get(0);
    }

    @PutMapping("/events/{id}")
    public Map<String, Object> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventRequest request,
            Authentication authentication) {
        Organizer organizer = current(authentication);
        Event event = eventService.update(id, request, organizer);
        return eventService.dashboardEvents(List.of(event)).get(0);
    }

    @DeleteMapping("/events/{id}")
    public Map<String, Object> deleteEvent(
            @PathVariable Long id, Authentication authentication) {
        Organizer organizer = current(authentication);
        return eventService.deleteEvent(id, organizer);
    }

    /** Registered students and their payment status for one of the club's events. */
    @GetMapping("/events/{id}/registrations")
    public List<Map<String, Object>> registrations(
            @PathVariable Long id, Authentication authentication) {
        Organizer organizer = current(authentication);

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Event not found."));
        eventService.assertCanManage(event, organizer);

        eventService.releaseExpiredHolds();

        return registrationRepository
                .findByEventIdOrderByRegisteredAtDesc(id).stream()
                .map(Views::registrationRow)
                .toList();
    }

    @PostMapping("/registrations/{id}/refunded")
    public Map<String, Object> markRefunded(
            @PathVariable Long id, Authentication authentication) {
        Organizer organizer = current(authentication);
        return Views.registrationRow(eventService.markRefunded(id, organizer));
    }
}
