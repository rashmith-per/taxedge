package com.taxedge.companyregistration.exception;

public class CompanyRegistrationValidationException extends CompanyRegistrationException {
    public CompanyRegistrationValidationException(String message) {
        super(message);
    }

    public CompanyRegistrationValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}