package com.booking.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    private Instant timestamp;
    private String path;
    private String errorCode;
    private String message;
    private Map<String, String> validationErrors;

    public static ErrorResponse of(String path, String errorCode, String message) {
        return ErrorResponse.builder()
                .timestamp(Instant.now())
                .path(path)
                .errorCode(errorCode)
                .message(message)
                .build();
    }

    public static ErrorResponse withValidationErrors(String path, Map<String, String> errors) {
        return ErrorResponse.builder()
                .timestamp(Instant.now())
                .path(path)
                .errorCode("VALIDATION_ERROR")
                .message("Validation failed")
                .validationErrors(errors)
                .build();
    }
}
