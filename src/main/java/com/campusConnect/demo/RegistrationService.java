package com.campusConnect.demo;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final EventService eventService;

    public RegistrationService(
            RegistrationRepository registrationRepository,
            EventRepository eventRepository,
            EventService eventService) {
        this.registrationRepository = registrationRepository;
        this.eventRepository = eventRepository;
        this.eventService = eventService;
    }

    /**
     * Register a student. The event row is locked while seats are counted,
     * so two students can never take the same last seat.
     *
     * Free event: registration is CONFIRMED straight away.
     * Paid event: registration is PENDING_PAYMENT and holds a seat until the
     * Razorpay payment is verified (or the hold expires).
     */
    @Transactional
    public Registration register(Student student, Long eventId) {
        eventService.releaseExpiredHolds();

        Event event = eventRepository.findByIdForUpdate(eventId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Event not found."));

        if ("CANCELLED".equals(event.getStatus())) {
            throw new ResponseStatusException(HttpStatus.GONE,
                    "This event has been cancelled.");
        }

        Optional<Registration> existing = registrationRepository
                .findByStudentIdAndEventId(student.getId(), event.getId());

        if (existing.isPresent()) {
            Registration current = existing.get();
            if ("PENDING_PAYMENT".equals(current.getStatus())) {
                // Student came back to finish paying: keep the same seat.
                current.setRegisteredAt(LocalDateTime.now());
                return registrationRepository.save(current);
            }
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "You are already registered for this event.");
        }

        long taken = registrationRepository.countByEventIdAndStatusIn(
                event.getId(), EventService.ACTIVE_STATUSES);

        if (taken >= event.getSeats()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Sorry, this event is full.");
        }

        Registration registration = new Registration();
        registration.setStudent(student);
        registration.setEvent(event);
        registration.setAmount(event.getPrice());

        if (event.getPrice() > 0) {
            registration.setStatus("PENDING_PAYMENT");
            registration.setPaymentStatus("PENDING");
        } else {
            registration.setStatus("CONFIRMED");
            registration.setPaymentStatus("NOT_REQUIRED");
        }

        return registrationRepository.save(registration);
    }
}
