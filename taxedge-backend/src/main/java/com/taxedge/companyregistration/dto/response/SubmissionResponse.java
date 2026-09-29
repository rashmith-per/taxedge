package com.taxedge.companyregistration.dto.response;

import java.time.LocalDateTime;

public record SubmissionResponse(Long applicationId, String applicationNumber, String status, LocalDateTime submittedAt) {}