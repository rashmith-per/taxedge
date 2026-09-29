package com.taxedge.companyregistration.dto.response;

import java.util.List;
import java.util.Map;

public record ReviewResponse(
        CompanyRegistrationResponse application, Map<String, Object> companyDetails,
        Map<String, Object> registeredOffice, List<Map<String, Object>> persons,
        Map<String, Object> capital, List<Map<String, Object>> shareholdings,
        List<DocumentResponse> documents, Map<String, Object> linkedRegistrations,
        List<Map<String, Object>> payments, List<TrackingResponse> tracking) {}