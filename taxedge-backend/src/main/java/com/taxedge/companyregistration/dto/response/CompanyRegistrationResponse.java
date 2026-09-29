package com.taxedge.companyregistration.dto.response;

import java.time.LocalDateTime;

public record CompanyRegistrationResponse(Long id, String applicationNumber, String companyType, String status, Integer currentStep, LocalDateTime createdAt, LocalDateTime updatedAt) {}