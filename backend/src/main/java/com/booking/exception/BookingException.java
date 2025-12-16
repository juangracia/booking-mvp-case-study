package com.booking.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class BookingException extends RuntimeException {

    private final String errorCode;
    private final HttpStatus status;

    public BookingException(String message, String errorCode, HttpStatus status) {
        super(message);
        this.errorCode = errorCode;
        this.status = status;
    }

    public static BookingException notFound(String resource, Object id) {
        return new BookingException(
                String.format("%s not found with id: %s", resource, id),
                "NOT_FOUND",
                HttpStatus.NOT_FOUND
        );
    }

    public static BookingException conflict(String message, String errorCode) {
        return new BookingException(message, errorCode, HttpStatus.CONFLICT);
    }

    public static BookingException badRequest(String message, String errorCode) {
        return new BookingException(message, errorCode, HttpStatus.BAD_REQUEST);
    }

    public static BookingException forbidden(String message) {
        return new BookingException(message, "FORBIDDEN", HttpStatus.FORBIDDEN);
    }

    public static BookingException unauthorized(String message) {
        return new BookingException(message, "UNAUTHORIZED", HttpStatus.UNAUTHORIZED);
    }
}
