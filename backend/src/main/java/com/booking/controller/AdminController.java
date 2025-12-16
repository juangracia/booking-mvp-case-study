package com.booking.controller;

import com.booking.dto.booking.BookingResponse;
import com.booking.dto.resource.ResourceRequest;
import com.booking.dto.resource.ResourceResponse;
import com.booking.service.BookingService;
import com.booking.service.ResourceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Administrative operations")
public class AdminController {

    private final ResourceService resourceService;
    private final BookingService bookingService;

    @GetMapping("/resources")
    @Operation(summary = "Get all resources (including inactive)")
    public ResponseEntity<List<ResourceResponse>> getAllResources() {
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    @PostMapping("/resources")
    @Operation(summary = "Create a new resource")
    public ResponseEntity<ResourceResponse> createResource(
            @Valid @RequestBody ResourceRequest request) {
        ResourceResponse response = resourceService.createResource(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/resources/{id}")
    @Operation(summary = "Update a resource")
    public ResponseEntity<ResourceResponse> updateResource(
            @PathVariable UUID id,
            @Valid @RequestBody ResourceRequest request) {
        return ResponseEntity.ok(resourceService.updateResource(id, request));
    }

    @GetMapping("/bookings")
    @Operation(summary = "Get all bookings with optional filters")
    public ResponseEntity<List<BookingResponse>> getAllBookings(
            @RequestParam(required = false) UUID resourceId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate) {
        return ResponseEntity.ok(bookingService.getAllBookings(resourceId, startDate, endDate));
    }

    @DeleteMapping("/bookings/{id}")
    @Operation(summary = "Cancel any booking (admin)")
    public ResponseEntity<BookingResponse> cancelBooking(@PathVariable UUID id) {
        return ResponseEntity.ok(bookingService.adminCancelBooking(id));
    }
}
