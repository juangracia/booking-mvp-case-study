package com.booking.controller;

import com.booking.dto.booking.AvailabilitySlot;
import com.booking.dto.resource.ResourceResponse;
import com.booking.service.BookingService;
import com.booking.service.ResourceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@Tag(name = "Resources", description = "View available resources")
public class ResourceController {

    private final ResourceService resourceService;
    private final BookingService bookingService;

    @GetMapping
    @Operation(summary = "Get all active resources")
    public ResponseEntity<List<ResourceResponse>> getActiveResources() {
        return ResponseEntity.ok(resourceService.getActiveResources());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get resource by ID")
    public ResponseEntity<ResourceResponse> getResource(@PathVariable UUID id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    @GetMapping("/{id}/availability")
    @Operation(summary = "Get availability for a resource on a specific date")
    public ResponseEntity<List<AvailabilitySlot>> getAvailability(
            @PathVariable UUID id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(bookingService.getAvailability(id, date));
    }
}
