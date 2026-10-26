
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

    public String generateToken(Student student) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(student.getEmail())
                .claim("studentId", student.getId())
                .claim("name", student.getName())
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

