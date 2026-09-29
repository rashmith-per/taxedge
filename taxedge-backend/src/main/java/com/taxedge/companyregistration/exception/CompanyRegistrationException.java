package com.taxedge.companyregistration.exception;

public class CompanyRegistrationException extends RuntimeException {
    public CompanyRegistrationException(String message) {
        super(message);
    }

    public CompanyRegistrationException(String message, Throwable cause) {
        super(message, cause);
    }
}