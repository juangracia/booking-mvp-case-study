package com.booking.dto.booking;

import com.booking.dto.resource.ResourceResponse;
import com.booking.dto.user.UserResponse;
import com.booking.entity.Booking;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {

    private UUID id;
    private ResourceResponse resource;
    private UserResponse user;
    private Instant startAt;
    private Instant endAt;
    private String status;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;

    public static BookingResponse from(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .resource(ResourceResponse.from(booking.getResource()))
                .user(UserResponse.from(booking.getUser()))
                .startAt(booking.getStartAt())
                .endAt(booking.getEndAt())
                .status(booking.getStatus().name())
                .notes(booking.getNotes())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }
}
