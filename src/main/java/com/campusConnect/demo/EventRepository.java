package com.campusConnect.demo;

import java.util.List;
import java.util.Optional;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EventRepository extends JpaRepository<Event, Long> {

    @Query("select e from Event e where e.status is null or e.status <> 'CANCELLED' order by e.id desc")
    List<Event> findAllActive();

    @Query("select e from Event e where e.organizer.id = :organizerId and (e.status is null or e.status <> 'CANCELLED') order by e.id desc")
    List<Event> findActiveByOrganizerId(@Param("organizerId") Long organizerId);

    @Query("select e from Event e where e.status is null or e.status <> 'CANCELLED'")
    List<Event> findActiveForAdmin();

    /** Row lock so two students cannot take the last seat at the same time. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select e from Event e where e.id = :id")
    Optional<Event> findByIdForUpdate(@Param("id") Long id);

    @Query("select count(e) from Event e where e.organizer.id = :organizerId")
    long countByOrganizerId(@Param("organizerId") Long organizerId);
}
