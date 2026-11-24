package com.campusConnect.demo;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/** Everything about creating, editing, cancelling and counting events. */
@Service
public class EventService {

    /** How long an unpaid registration keeps its seat. */
    public static final int HOLD_MINUTES = 30;

    public static final List<String> ACTIVE_STATUSES =
            List.of("CONFIRMED", "PENDING_PAYMENT");

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final OrganizerRepository organizerRepository;
    private final NotificationRepository notificationRepository;

    public EventService(
            EventRepository eventRepository,
            RegistrationRepository registrationRepository,
            OrganizerRepository organizerRepository,
            NotificationRepository notificationRepository) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.organizerRepository = organizerRepository;
        this.notificationRepository = notificationRepository;
    }

    /** Frees seats held by students who started paying but never finished. */
    @Transactional
    public void releaseExpiredHolds() {
        registrationRepository.deleteExpiredPending(
                LocalDateTime.now().minusMinutes(HOLD_MINUTES));
    }

    /** eventId -> seats taken (confirmed + held). */
    private Map<Long, Long> seatsTaken() {
        Map<Long, Long> map = new HashMap<>();
        for (Object[] row : registrationRepository.countActiveGroupedByEvent()) {
            map.put((Long) row[0], ((Number) row[1]).longValue());
        }
        return map;
    }

    /** Public event list with the number of seats still free. */
    @Transactional
    public List<Event> publicEvents() {
        releaseExpiredHolds();
        Map<Long, Long> taken = seatsTaken();
        List<Event> events = eventRepository.findAllActive();
        for (Event event : events) {
            decorate(event, taken);
        }
        return events;
    }

    private void decorate(Event event, Map<Long, Long> taken) {
        long used = taken.getOrDefault(event.getId(), 0L);
        event.setSeatsLeft((int) Math.max(0, event.getSeats() - used));
        if (event.getOrganizer() != null) {
            event.setOrganizerId(event.getOrganizer().getId());
            event.setOrganizerName(event.getOrganizer().getClubName());
        } else {
            event.setOrganizerName("College");
        }
    }

    /** Events plus registration and payment numbers, for the dashboards. */
    @Transactional
    public List<Map<String, Object>> dashboardEvents(List<Event> events) {
        releaseExpiredHolds();
        Map<Long, long[]> stats = new HashMap<>();
        // [confirmed, pending, paid, refundPending, revenue]
        for (Registration r : registrationRepository.findAll()) {
            long[] s = stats.computeIfAbsent(
                    r.getEvent().getId(), k -> new long[5]);
            String status = r.getStatus();
            String pay = r.getPaymentStatus();
            if ("CONFIRMED".equals(status)) s[0]++;
            if ("PENDING_PAYMENT".equals(status)) s[1]++;
            if ("PAID".equals(pay)) { s[2]++; s[4] += r.getAmount(); }
            if ("REFUND_PENDING".equals(pay)) s[3]++;
        }

        List<Map<String, Object>> result = new java.util.ArrayList<>();
        for (Event event : events) {
            long[] s = stats.getOrDefault(event.getId(), new long[5]);
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", event.getId());
            item.put("title", event.getTitle());
            item.put("category", event.getCategory());
            item.put("date", event.getDate());
            item.put("time", event.getTime());
            item.put("location", event.getLocation());
            item.put("seats", event.getSeats());
            item.put("price", event.getPrice());
            item.put("description", event.getDescription());
            item.put("icon", event.getIcon());
            item.put("color", event.getColor());
            item.put("status", event.getStatus());
            item.put("organizerId",
                    event.getOrganizer() == null ? null : event.getOrganizer().getId());
            item.put("organizerName",
                    event.getOrganizer() == null ? "College" : event.getOrganizer().getClubName());
            item.put("seatsLeft", Math.max(0, event.getSeats() - (s[0] + s[1])));
            item.put("registered", s[0]);
            item.put("pendingPayment", s[1]);
            item.put("paid", s[2]);
            item.put("refundPending", s[3]);
            item.put("revenue", s[4]);
            result.add(item);
        }
        return result;
    }

    private void apply(Event event, EventRequest req) {
        event.setTitle(req.getTitle().trim());
        event.setCategory(req.getCategory().trim());
        event.setDate(req.getDate().trim());
        event.setTime(req.getTime().trim());
        event.setLocation(req.getLocation().trim());
        event.setSeats(req.getSeats());
        event.setPrice(req.getPrice() == null ? 0 : req.getPrice());
        event.setDescription(req.getDescription() == null
                ? null : req.getDescription().trim());
        if (req.getIcon() != null && !req.getIcon().isBlank()) {
            event.setIcon(req.getIcon().trim());
        }
        if (req.getColor() != null && !req.getColor().isBlank()) {
            event.setColor(req.getColor().trim());
        }
    }

    /** Create an event. owner null = college / admin. */
    @Transactional
    public Event create(EventRequest req, Organizer owner) {
        Event event = new Event();
        apply(event, req);
        if (event.getIcon() == null) event.setIcon("✦");
        event.setStatus("ACTIVE");
        event.setOrganizer(owner);
        return eventRepository.save(event);
    }

    /**
     * Edit an event. When actor is an organizer they may only edit their own;
     * admin passes actor = null and may also reassign the owning club.
     */
    @Transactional
    public Event update(Long id, EventRequest req, Organizer actor) {
        Event event = findOwned(id, actor);
        releaseExpiredHolds();

        long taken = registrationRepository
                .countByEventIdAndStatusIn(id, ACTIVE_STATUSES);
        if (req.getSeats() < taken) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Seats cannot be lower than the " + taken
                            + " students already registered.");
        }

        apply(event, req);

        if (actor == null) {
            event.setOrganizer(resolveOrganizer(req.getOrganizerId()));
        }
        return eventRepository.save(event);
    }

    /**
     * Delete an event. With no registrations it is removed outright.
     * Otherwise every registration is cancelled, paid ones are marked for
     * refund, each student gets an in-app notification, and the event is
     * kept in the database as CANCELLED so the history stays intact.
     */
    @Transactional
    public Map<String, Object> deleteEvent(Long id, Organizer actor) {
        Event event = findOwned(id, actor);
        List<Registration> registrations =
                registrationRepository.findByEventIdOrderByRegisteredAtDesc(id);

        int cancelled = 0;
        int refunds = 0;

        for (Registration r : registrations) {
            String status = r.getStatus();
            if (!"CONFIRMED".equals(status) && !"PENDING_PAYMENT".equals(status)) {
                continue;
            }

            boolean paid = "PAID".equals(r.getPaymentStatus());
            r.setStatus("CANCELLED");
            r.setCancelledAt(LocalDateTime.now());

            String message;
            if (paid) {
                r.setPaymentStatus("REFUND_PENDING");
                r.setCancelReason("Event cancelled by the organizers. "
                        + "Your payment of ₹" + r.getAmount()
                        + " is marked for refund.");
                message = "\"" + event.getTitle() + "\" has been cancelled by the "
                        + "organizers. Your payment of ₹" + r.getAmount()
                        + " has been marked for refund.";
                refunds++;
            } else {
                if ("PENDING".equals(r.getPaymentStatus())) {
                    r.setPaymentStatus("VOID");
                }
                r.setCancelReason("Event cancelled by the organizers.");
                message = "\"" + event.getTitle()
                        + "\" has been cancelled by the organizers.";
            }

            registrationRepository.save(r);
            notificationRepository.save(new Notification(r.getStudent(), message));
            cancelled++;
        }

        boolean hadRegistrations = !registrations.isEmpty();
        if (hadRegistrations) {
            event.setStatus("CANCELLED");
            eventRepository.save(event);
        } else {
            eventRepository.delete(event);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("message", "Event deleted.");
        result.put("registrationsCancelled", cancelled);
        result.put("refundsPending", refunds);
        return result;
    }

    /** Mark a REFUND_PENDING payment as refunded. */
    @Transactional
    public Registration markRefunded(Long registrationId, Organizer actor) {
        Registration r = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Registration not found."));

        assertCanManage(r.getEvent(), actor);

        if (!"REFUND_PENDING".equals(r.getPaymentStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "This payment is not waiting for a refund.");
        }
        r.setPaymentStatus("REFUNDED");
        return registrationRepository.save(r);
    }

    public void assertCanManage(Event event, Organizer actor) {
        if (actor != null && (event.getOrganizer() == null
                || !event.getOrganizer().getId().equals(actor.getId()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "This event belongs to another club.");
        }
    }

    public Event findOwned(Long id, Organizer actor) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Event not found."));
        assertCanManage(event, actor);
        if ("CANCELLED".equals(event.getStatus())) {
            throw new ResponseStatusException(HttpStatus.GONE,
                    "This event has already been cancelled.");
        }
        return event;
    }

    public Organizer resolveOrganizer(Long organizerId) {
        if (organizerId == null) return null;
        return organizerRepository.findById(organizerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Selected club does not exist."));
    }
}
