package com.taxedge.companyregistration.dto.response;

import java.time.LocalDateTime;

public record DocumentResponse(Long id, String custId, String documentType, String name, String category, boolean required, String fileName, String fileUri, Long fileSize, String mimeType, String status, LocalDateTime uploadedAt, LocalDateTime verifiedAt, String remarks) {}