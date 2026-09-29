package com.taxedge.companyregistration.service;

import com.taxedge.companyregistration.dto.request.CompanyDetailsRequest;
import java.util.Map;

public interface CompanyDetailsService {
    Map<String, Object> updateDetails(Long registrationId, CompanyDetailsRequest request);
}