package com.taxedge.companyregistration.dto.request;

public record CreateCompanyRegistrationRequest(String companyType, Long applicationId, Integer currentStep) {}