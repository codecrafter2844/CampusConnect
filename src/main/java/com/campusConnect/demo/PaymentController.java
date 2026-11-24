package com.campusConnect.demo;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/** Razorpay checkout for paid events (student only). */
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final RegistrationRepository registrationRepository;
    private final RazorpayService razorpayService;

    public PaymentController(
            RegistrationRepository registrationRepository,
            RazorpayService razorpayService) {
        this.registrationRepository = registrationRepository;
        this.razorpayService = razorpayService;
    }

    private Registration ownRegistration(Long id, Authentication auth) {
        Registration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Registration not found. It may have expired - "
                                + "please register again."));

        if (!registration.getStudent().getEmail().equals(auth.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "This registration belongs to another student.");
        }
        return registration;
    }

    /** Step 1: create a Razorpay order for the pending registration. */
    @PostMapping("/{registrationId}/order")
    @Transactional
    public Map<String, Object> createOrder(
            @PathVariable Long registrationId,
            Authentication authentication) {

        Registration registration =
                ownRegistration(registrationId, authentication);

        if ("PAID".equals(registration.getPaymentStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This registration is already paid.");
        }
        if (!"PENDING_PAYMENT".equals(registration.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This registration is not waiting for payment.");
        }
        if ("CANCELLED".equals(registration.getEvent().getStatus())) {
            throw new ResponseStatusException(HttpStatus.GONE,
                    "This event has been cancelled.");
        }

        String orderId = razorpayService.createOrder(
                registration.getAmount(), "reg_" + registration.getId());

        registration.setRazorpayOrderId(orderId);
        // Pushes the seat hold forward while the student pays.
        registration.setRegisteredAt(LocalDateTime.now());
        registrationRepository.save(registration);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("keyId", razorpayService.getKeyId());
        response.put("orderId", orderId);
        response.put("amount", registration.getAmount() * 100);
        response.put("currency", "INR");
        response.put("eventTitle", registration.getEvent().getTitle());
        response.put("studentName", registration.getStudent().getName());
        response.put("studentEmail", registration.getStudent().getEmail());
        return response;
    }

    /** Step 2: verify the signature Razorpay returned and confirm the seat. */
    @PostMapping("/{registrationId}/verify")
    @Transactional
    public Map<String, Object> verify(
            @PathVariable Long registrationId,
            @Valid @RequestBody PaymentVerifyRequest request,
            Authentication authentication) {

        Registration registration =
                ownRegistration(registrationId, authentication);

        if ("PAID".equals(registration.getPaymentStatus())) {
            return Map.of("message", "Payment already confirmed.",
                    "status", registration.getStatus(),
                    "paymentStatus", registration.getPaymentStatus());
        }

        if (registration.getRazorpayOrderId() == null
                || !registration.getRazorpayOrderId()
                        .equals(request.getRazorpayOrderId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "This payment does not match your registration.");
        }

        if (!razorpayService.verifySignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Payment verification failed. If money was deducted, "
                            + "contact the organizers with your payment ID.");
        }

        registration.setStatus("CONFIRMED");
        registration.setPaymentStatus("PAID");
        registration.setRazorpayPaymentId(request.getRazorpayPaymentId());
        registration.setPaidAt(LocalDateTime.now());
        registrationRepository.save(registration);

        return Map.of("message", "Payment successful. You are registered!",
                "status", registration.getStatus(),
                "paymentStatus", registration.getPaymentStatus());
    }
}
