package com.campusConnect.demo;


import java.security.Key;
import java.util.Date;

import javax.crypto.spec.SecretKeySpec;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    public static final String ROLE_STUDENT = "STUDENT";
    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_ORGANIZER = "ORGANIZER";

    private final Key signingKey;
    private final long expirationMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs) {

        byte[] keyBytes = java.util.Base64.getDecoder().decode(secret);

        this.signingKey = new SecretKeySpec(
                keyBytes, "HmacSHA256");

        this.expirationMs = expirationMs;
    }

    /** Student token (unchanged behaviour, now carries role=STUDENT). */
    public String generateToken(Student student) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(student.getEmail())
                .claim("role", ROLE_STUDENT)
                .claim("studentId", student.getId())
                .claim("name", student.getName())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey)
                .compact();
    }

    /** College admin token. Subject is the admin email. */
    public String generateAdminToken(Admin admin) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(admin.getEmail())
                .claim("role", ROLE_ADMIN)
                .claim("name", admin.getName())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey)
                .compact();
    }

    /**
     * Club organizer token. Subject is the generated login ID. While
     * mustChange is true the token only works for the change-password call.
     */
    public String generateOrganizerToken(Organizer organizer) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(organizer.getLoginId())
                .claim("role", ROLE_ORGANIZER)
                .claim("name", organizer.getClubName())
                .claim("mustChange", organizer.isMustChangePassword())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey)
                .compact();
    }

    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isTokenValid(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (io.jsonwebtoken.JwtException |
                 IllegalArgumentException exception) {
            return false;
        }
    }
}
