
package com.campusConnect.demo;

import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpMethod;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/",
                    "/api/hello",
                    "/api/auth/signup",
                    "/api/auth/login",
                    "/api/admin/auth/login",
                    "/api/organizer/auth/login",
                    // Without this, any server error (500) is shown as a
                    // confusing 403 because Spring's /error page is blocked.
                    "/error"
                ).permitAll()
                .requestMatchers(HttpMethod.GET, "/api/events").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Organizer who still has a temporary password.
                .requestMatchers(
                    "/api/organizer/auth/change-password",
                    "/api/organizer/auth/me"
                ).hasAnyRole("ORGANIZER", "ORGANIZER_PENDING")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/organizer/**").hasRole("ORGANIZER")
                .requestMatchers(
                    "/api/auth/me",
                    "/api/registrations/**",
                    "/api/payments/**",
                    "/api/notifications/**"
                ).hasRole("STUDENT")
                .anyRequest().authenticated()
            )
            .httpBasic(basic -> basic.disable())
            .formLogin(form -> form.disable())
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}
