package com.taxedge.companyregistration.dto.response;

import java.time.LocalDateTime;

public record TrackingResponse(Long id, String stage, String status, String description, LocalDateTime startedAt, LocalDateTime completedAt, String remarks) {}