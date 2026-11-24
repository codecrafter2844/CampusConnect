package com.campusConnect.demo;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RegistrationRepository
        extends JpaRepository<Registration, Long> {

    boolean existsByStudentIdAndEventId(Long studentId, Long eventId);

    Optional<Registration> findByStudentIdAndEventId(Long studentId, Long eventId);

    List<Registration> findByStudentId(Long studentId);

    List<Registration> findByEventIdOrderByRegisteredAtDesc(Long eventId);

    List<Registration> findAllByOrderByRegisteredAtDesc();

    long countByEventIdAndStatusIn(Long eventId, Collection<String> statuses);

    /** Seats taken = confirmed + payment-pending (held) registrations. */
    @Query("select r.event.id, count(r) from Registration r "
            + "where r.status in ('CONFIRMED','PENDING_PAYMENT') group by r.event.id")
    List<Object[]> countActiveGroupedByEvent();

    /** Releases seats held by students who never finished paying. */
    @Modifying
    @Query("delete from Registration r where r.status = 'PENDING_PAYMENT' and r.registeredAt < :cutoff")
    int deleteExpiredPending(@Param("cutoff") LocalDateTime cutoff);

    @Modifying
    @Query("delete from Registration r where r.event.id = :eventId")
    int deleteByEventId(@Param("eventId") Long eventId);
}
