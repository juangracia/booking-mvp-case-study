package com.booking.dto.booking;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class BookingRequest {

    @NotNull(message = "Resource ID is required")
    private UUID resourceId;

    @NotNull(message = "Start time is required")
    @Future(message = "Start time must be in the future")
    private Instant startAt;

    @NotNull(message = "End time is required")
    @Future(message = "End time must be in the future")
    private Instant endAt;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;
}
