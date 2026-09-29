package com.taxedge.companyregistration.dto.response;

import java.time.LocalDateTime;
import java.util.Map;

public record ReceiptResponse(Long applicationId, String applicationNumber, String companyType, String status, LocalDateTime submittedAt, Map<String, Object> payment) {}