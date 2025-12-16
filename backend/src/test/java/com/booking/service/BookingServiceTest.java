package com.booking.service;

import com.booking.dto.booking.BookingRequest;
import com.booking.dto.booking.BookingResponse;
import com.booking.entity.Booking;
import com.booking.entity.Resource;
import com.booking.entity.User;
import com.booking.exception.BookingException;
import com.booking.repository.BookingRepository;
import com.booking.repository.UserRepository;
import com.booking.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ResourceService resourceService;

    @InjectMocks
    private BookingService bookingService;

    private User testUser;
    private Resource testResource;
    private UserPrincipal testPrincipal;
    private UUID userId;
    private UUID resourceId;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(bookingService, "maxDurationHours", 8);

        userId = UUID.randomUUID();
        resourceId = UUID.randomUUID();

        testUser = User.builder()
                .id(userId)
                .email("test@example.com")
                .password("encoded")
                .role(User.Role.USER)
                .build();

        testResource = Resource.builder()
                .id(resourceId)
                .name("Test Room")
                .description("A test room")
                .active(true)
                .build();

        testPrincipal = UserPrincipal.from(testUser);
    }

    @Test
    void createBooking_Success() {
        Instant startAt = Instant.now().plus(1, ChronoUnit.HOURS);
        Instant endAt = startAt.plus(2, ChronoUnit.HOURS);

        BookingRequest request = BookingRequest.builder()
                .resourceId(resourceId)
                .startAt(startAt)
                .endAt(endAt)
                .notes("Test booking")
                .build();

        Booking savedBooking = Booking.builder()
                .id(UUID.randomUUID())
                .user(testUser)
                .resource(testResource)
                .startAt(startAt)
                .endAt(endAt)
                .status(Booking.Status.ACTIVE)
                .notes("Test booking")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        when(resourceService.findResourceById(resourceId)).thenReturn(testResource);
        when(bookingRepository.existsOverlappingBooking(resourceId, startAt, endAt)).thenReturn(false);
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(bookingRepository.save(any(Booking.class))).thenReturn(savedBooking);

        BookingResponse response = bookingService.createBooking(request, testPrincipal);

        assertThat(response).isNotNull();
        assertThat(response.getStatus()).isEqualTo("ACTIVE");
        assertThat(response.getNotes()).isEqualTo("Test booking");
    }

    @Test
    void createBooking_OverlapDetected() {
        Instant startAt = Instant.now().plus(1, ChronoUnit.HOURS);
        Instant endAt = startAt.plus(2, ChronoUnit.HOURS);

        BookingRequest request = BookingRequest.builder()
                .resourceId(resourceId)
                .startAt(startAt)
                .endAt(endAt)
                .build();

        when(resourceService.findResourceById(resourceId)).thenReturn(testResource);
        when(bookingRepository.existsOverlappingBooking(resourceId, startAt, endAt)).thenReturn(true);

        assertThatThrownBy(() -> bookingService.createBooking(request, testPrincipal))
                .isInstanceOf(BookingException.class)
                .hasMessageContaining("overlaps");
    }

    @Test
    void createBooking_InactiveResource() {
        testResource.setActive(false);

        Instant startAt = Instant.now().plus(1, ChronoUnit.HOURS);
        Instant endAt = startAt.plus(2, ChronoUnit.HOURS);

        BookingRequest request = BookingRequest.builder()
                .resourceId(resourceId)
                .startAt(startAt)
                .endAt(endAt)
                .build();

        when(resourceService.findResourceById(resourceId)).thenReturn(testResource);

        assertThatThrownBy(() -> bookingService.createBooking(request, testPrincipal))
                .isInstanceOf(BookingException.class)
                .hasMessageContaining("inactive");
    }

    @Test
    void createBooking_InvalidTimeRange() {
        Instant startAt = Instant.now().plus(3, ChronoUnit.HOURS);
        Instant endAt = Instant.now().plus(1, ChronoUnit.HOURS);

        BookingRequest request = BookingRequest.builder()
                .resourceId(resourceId)
                .startAt(startAt)
                .endAt(endAt)
                .build();

        assertThatThrownBy(() -> bookingService.createBooking(request, testPrincipal))
                .isInstanceOf(BookingException.class)
                .hasMessageContaining("before");
    }

    @Test
    void createBooking_ExceedsMaxDuration() {
        Instant startAt = Instant.now().plus(1, ChronoUnit.HOURS);
        Instant endAt = startAt.plus(10, ChronoUnit.HOURS);

        BookingRequest request = BookingRequest.builder()
                .resourceId(resourceId)
                .startAt(startAt)
                .endAt(endAt)
                .build();

        assertThatThrownBy(() -> bookingService.createBooking(request, testPrincipal))
                .isInstanceOf(BookingException.class)
                .hasMessageContaining("exceed");
    }

    @Test
    void cancelBooking_Success() {
        UUID bookingId = UUID.randomUUID();

        Booking booking = Booking.builder()
                .id(bookingId)
                .user(testUser)
                .resource(testResource)
                .startAt(Instant.now().plus(1, ChronoUnit.HOURS))
                .endAt(Instant.now().plus(2, ChronoUnit.HOURS))
                .status(Booking.Status.ACTIVE)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        BookingResponse response = bookingService.cancelBooking(bookingId, testPrincipal);

        assertThat(response.getStatus()).isEqualTo("CANCELLED");
    }

    @Test
    void cancelBooking_NotOwner() {
        UUID bookingId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();

        User otherUser = User.builder()
                .id(otherUserId)
                .email("other@example.com")
                .password("encoded")
                .role(User.Role.USER)
                .build();

        Booking booking = Booking.builder()
                .id(bookingId)
                .user(otherUser)
                .resource(testResource)
                .startAt(Instant.now().plus(1, ChronoUnit.HOURS))
                .endAt(Instant.now().plus(2, ChronoUnit.HOURS))
                .status(Booking.Status.ACTIVE)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.cancelBooking(bookingId, testPrincipal))
                .isInstanceOf(BookingException.class)
                .hasMessageContaining("own bookings");
    }

    @Test
    void cancelBooking_AlreadyCancelled() {
        UUID bookingId = UUID.randomUUID();

        Booking booking = Booking.builder()
                .id(bookingId)
                .user(testUser)
                .resource(testResource)
                .startAt(Instant.now().plus(1, ChronoUnit.HOURS))
                .endAt(Instant.now().plus(2, ChronoUnit.HOURS))
                .status(Booking.Status.CANCELLED)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.cancelBooking(bookingId, testPrincipal))
                .isInstanceOf(BookingException.class)
                .hasMessageContaining("active bookings");
    }

    @Test
    void getUserBookings_ReturnsBookings() {
        when(bookingRepository.findByUserIdOrderByStartAtDesc(userId))
                .thenReturn(Collections.emptyList());

        var bookings = bookingService.getUserBookings(userId);

        assertThat(bookings).isEmpty();
    }
}
