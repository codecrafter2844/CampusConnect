package com.campusConnect.demo;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Map;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

/**
 * Talks to Razorpay: creates orders and verifies payment signatures.
 * Works with test keys (rzp_test_...) at no cost.
 */
@Service
public class RazorpayService {

    private final String keyId;
    private final String keySecret;
    private final RestClient client;

    public RazorpayService(
            @Value("${razorpay.key-id:}") String keyId,
            @Value("${razorpay.key-secret:}") String keySecret,
            @Value("${razorpay.api-base:https://api.razorpay.com/v1}") String apiBase) {
        this.keyId = keyId == null ? "" : keyId.trim();
        this.keySecret = keySecret == null ? "" : keySecret.trim();
        this.client = RestClient.builder().baseUrl(apiBase).build();
    }

    public boolean isConfigured() {
        return !keyId.isEmpty() && !keySecret.isEmpty();
    }

    public String getKeyId() {
        return keyId;
    }

    /** Creates a Razorpay order and returns its id (order_xxx). */
    @SuppressWarnings("unchecked")
    public String createOrder(int amountRupees, String receipt) {
        if (!isConfigured()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Payments are not set up yet. Add RAZORPAY_KEY_ID and "
                            + "RAZORPAY_KEY_SECRET to .env and restart the server.");
        }

        Map<String, Object> body = Map.of(
                "amount", amountRupees * 100L,   // Razorpay works in paise
                "currency", "INR",
                "receipt", receipt);

        try {
            Map<String, Object> response = client.post()
                    .uri("/orders")
                    .headers(h -> h.setBasicAuth(keyId, keySecret))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            if (response == null || response.get("id") == null) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "Razorpay did not return an order.");
            }
            return String.valueOf(response.get("id"));
        } catch (RestClientException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Could not reach Razorpay. Check the test keys and "
                            + "your internet connection.");
        }
    }

    /** Checks that the callback really came from Razorpay for this order. */
    public boolean verifySignature(
            String orderId, String paymentId, String signature) {
        if (!isConfigured() || signature == null) return false;
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(
                    keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] digest = mac.doFinal(
                    (orderId + "|" + paymentId).getBytes(StandardCharsets.UTF_8));
            String expected = HexFormat.of().formatHex(digest);
            return MessageDigest.isEqual(
                    expected.getBytes(StandardCharsets.UTF_8),
                    signature.trim().toLowerCase()
                            .getBytes(StandardCharsets.UTF_8));
        } catch (Exception ex) {
            return false;
        }
    }
}
