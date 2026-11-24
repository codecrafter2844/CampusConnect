package com.campusConnect.demo;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrganizerRepository extends JpaRepository<Organizer, Long> {
    Optional<Organizer> findByLoginId(String loginId);
    boolean existsByLoginId(String loginId);
}
