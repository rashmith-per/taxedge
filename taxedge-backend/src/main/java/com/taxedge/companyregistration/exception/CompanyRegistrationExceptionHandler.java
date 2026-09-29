package com.taxedge.companyregistration.exception;

import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@Slf4j
@Order(Ordered.HIGHEST_PRECEDENCE)
@RestControllerAdvice(basePackages = "com.taxedge.companyregistration")
public class CompanyRegistrationExceptionHandler {
    @ExceptionHandler(CompanyRegistrationNotFoundException.class)
    public ResponseEntity<Map<String, Object>> notFound(CompanyRegistrationNotFoundException exception) {
        return response(HttpStatus.NOT_FOUND, exception.getMessage());
    }

    @ExceptionHandler(CompanyRegistrationValidationException.class)
    public ResponseEntity<Map<String, Object>> validation(CompanyRegistrationValidationException exception) {
        return response(HttpStatus.BAD_REQUEST, exception.getMessage());
    }

    @ExceptionHandler(CompanyRegistrationConflictException.class)
    public ResponseEntity<Map<String, Object>> registrationConflict(CompanyRegistrationConflictException exception) {
        return response(HttpStatus.CONFLICT, exception.getMessage());
    }

    @ExceptionHandler(CompanyRegistrationException.class)
    public ResponseEntity<Map<String, Object>> registrationFailure(CompanyRegistrationException exception) {
        log.error("Company registration operation failed", exception);
        return response(HttpStatus.INTERNAL_SERVER_ERROR, "Company registration operation failed");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> badRequest(IllegalArgumentException exception) {
        return response(HttpStatus.BAD_REQUEST, exception.getMessage());
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> tooLarge(MaxUploadSizeExceededException exception) {
        return response(HttpStatus.PAYLOAD_TOO_LARGE, "Uploaded file exceeds the configured size limit");
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> conflict(DataIntegrityViolationException exception) {
        log.warn("Company registration request violated a data constraint");
        return response(HttpStatus.CONFLICT, "Company registration data conflicts with an existing record");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> unexpected(Exception exception) {
        log.error("Unhandled company registration error", exception);
        return response(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected company registration error occurred");
    }

    private ResponseEntity<Map<String, Object>> response(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("status", status.value(), "message", message == null ? status.getReasonPhrase() : message));
    }
}     
