package com.booking.repository;

import com.booking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

    List<Booking> findByUserIdOrderByStartAtDesc(UUID userId);

    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId " +
           "AND b.status = 'ACTIVE' " +
           "AND b.startAt < :endAt " +
           "AND b.endAt > :startAt")
    List<Booking> findOverlappingBookings(
            @Param("resourceId") UUID resourceId,
            @Param("startAt") Instant startAt,
            @Param("endAt") Instant endAt);

    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId " +
           "AND b.status = 'ACTIVE' " +
           "AND b.startAt >= :dayStart " +
           "AND b.startAt < :dayEnd " +
           "ORDER BY b.startAt")
    List<Booking> findActiveBookingsForResourceOnDate(
            @Param("resourceId") UUID resourceId,
            @Param("dayStart") Instant dayStart,
            @Param("dayEnd") Instant dayEnd);

    @Query("SELECT b FROM Booking b " +
           "WHERE (:resourceId IS NULL OR b.resource.id = :resourceId) " +
           "AND (:startDate IS NULL OR b.startAt >= :startDate) " +
           "AND (:endDate IS NULL OR b.startAt <= :endDate) " +
           "ORDER BY b.startAt DESC")
    List<Booking> findAllWithFilters(
            @Param("resourceId") UUID resourceId,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.resource.id = :resourceId " +
           "AND b.status = 'ACTIVE' " +
           "AND b.startAt < :endAt " +
           "AND b.endAt > :startAt")
    boolean existsOverlappingBooking(
            @Param("resourceId") UUID resourceId,
            @Param("startAt") Instant startAt,
            @Param("endAt") Instant endAt);
}
