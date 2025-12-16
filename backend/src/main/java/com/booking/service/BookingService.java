package com.booking.service;

import com.booking.dto.booking.AvailabilitySlot;
import com.booking.dto.booking.BookingRequest;
import com.booking.dto.booking.BookingResponse;
import com.booking.entity.Booking;
import com.booking.entity.Resource;
import com.booking.entity.User;
import com.booking.exception.BookingException;
import com.booking.repository.BookingRepository;
import com.booking.repository.UserRepository;
import com.booking.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ResourceService resourceService;

    @Value("${app.booking.max-duration-hours:8}")
    private int maxDurationHours;

    public List<BookingResponse> getUserBookings(UUID userId) {
        return bookingRepository.findByUserIdOrderByStartAtDesc(userId)
                .stream()
                .map(BookingResponse::from)
                .toList();
    }

    public List<BookingResponse> getAllBookings(UUID resourceId, Instant startDate, Instant endDate) {
        return bookingRepository.findAllWithFilters(resourceId, startDate, endDate)
                .stream()
                .map(BookingResponse::from)
                .toList();
    }

    public BookingResponse getBookingById(UUID id) {
        Booking booking = findBookingById(id);
        return BookingResponse.from(booking);
    }

    public List<AvailabilitySlot> getAvailability(UUID resourceId, LocalDate date) {
        Instant dayStart = date.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant dayEnd = dayStart.plus(1, ChronoUnit.DAYS);

        List<Booking> bookings = bookingRepository.findActiveBookingsForResourceOnDate(
                resourceId, dayStart, dayEnd);

        List<AvailabilitySlot> slots = new ArrayList<>();

        for (Booking booking : bookings) {
            slots.add(AvailabilitySlot.builder()
                    .startAt(booking.getStartAt())
                    .endAt(booking.getEndAt())
                    .booked(true)
                    .bookingId(booking.getId())
                    .build());
        }

        return slots;
    }

    @Transactional
    public BookingResponse createBooking(BookingRequest request, UserPrincipal principal) {
        validateTimeRange(request.getStartAt(), request.getEndAt());

        Resource resource = resourceService.findResourceById(request.getResourceId());

        if (!resource.getActive()) {
            throw BookingException.badRequest(
                    "Cannot book an inactive resource",
                    "RESOURCE_INACTIVE"
            );
        }

        if (bookingRepository.existsOverlappingBooking(
                request.getResourceId(),
                request.getStartAt(),
                request.getEndAt())) {
            throw BookingException.conflict(
                    "The requested time slot overlaps with an existing booking",
                    "BOOKING_OVERLAP"
            );
        }

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> BookingException.notFound("User", principal.getId()));

        Booking booking = Booking.builder()
                .user(user)
                .resource(resource)
                .startAt(request.getStartAt())
                .endAt(request.getEndAt())
                .notes(request.getNotes())
                .status(Booking.Status.ACTIVE)
                .build();

        booking = bookingRepository.save(booking);
        log.info("Booking created: {} for resource {} by user {}",
                booking.getId(), resource.getName(), user.getEmail());

        return BookingResponse.from(booking);
    }

    @Transactional
    public BookingResponse cancelBooking(UUID bookingId, UserPrincipal principal) {
        Booking booking = findBookingById(bookingId);

        if (!principal.isAdmin() && !booking.getUser().getId().equals(principal.getId())) {
            throw BookingException.forbidden("You can only cancel your own bookings");
        }

        if (booking.getStatus() != Booking.Status.ACTIVE) {
            throw BookingException.badRequest(
                    "Only active bookings can be cancelled",
                    "INVALID_STATUS"
            );
        }

        booking.setStatus(Booking.Status.CANCELLED);
        booking = bookingRepository.save(booking);

        log.info("Booking cancelled: {} by user {}",
                booking.getId(), principal.getEmail());

        return BookingResponse.from(booking);
    }

    @Transactional
    public BookingResponse adminCancelBooking(UUID bookingId) {
        Booking booking = findBookingById(bookingId);

        if (booking.getStatus() != Booking.Status.ACTIVE) {
            throw BookingException.badRequest(
                    "Only active bookings can be cancelled",
                    "INVALID_STATUS"
            );
        }

        booking.setStatus(Booking.Status.CANCELLED);
        booking = bookingRepository.save(booking);

        log.info("Booking cancelled by admin: {}", booking.getId());

        return BookingResponse.from(booking);
    }

    private void validateTimeRange(Instant startAt, Instant endAt) {
        if (!startAt.isBefore(endAt)) {
            throw BookingException.badRequest(
                    "Start time must be before end time",
                    "INVALID_TIME_RANGE"
            );
        }

        Duration duration = Duration.between(startAt, endAt);
        if (duration.toHours() > maxDurationHours) {
            throw BookingException.badRequest(
                    String.format("Booking duration cannot exceed %d hours", maxDurationHours),
                    "DURATION_EXCEEDED"
            );
        }

        if (startAt.isBefore(Instant.now())) {
            throw BookingException.badRequest(
                    "Start time must be in the future",
                    "PAST_START_TIME"
            );
        }
    }

    private Booking findBookingById(UUID id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> BookingException.notFound("Booking", id));
    }
}
