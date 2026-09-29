package com.taxedge.companyregistration.service;

import com.taxedge.companyregistration.dto.request.LinkedRegistrationRequest;
import java.util.Map;

public interface LinkedRegistrationService {
    Map<String, Object> updateLinkedRegistrations(Long registrationId, LinkedRegistrationRequest request);
    Map<String, Object> linkedRegistrations(Long registrationId);
}