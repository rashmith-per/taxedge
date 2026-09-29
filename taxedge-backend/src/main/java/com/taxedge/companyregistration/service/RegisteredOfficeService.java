package com.taxedge.companyregistration.service;

import com.taxedge.companyregistration.dto.request.RegisteredOfficeRequest;
import java.util.Map;

public interface RegisteredOfficeService {
    Map<String, Object> updateOffice(Long registrationId, RegisteredOfficeRequest request);
}