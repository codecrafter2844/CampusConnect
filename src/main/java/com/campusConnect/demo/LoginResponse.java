
package com.campusConnect.demo;

public record LoginResponse(
    Long id,
    String name,
    String email,
    String message,
    String token
) {
}
