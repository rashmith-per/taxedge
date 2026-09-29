package com.taxedge.companyregistration.service.impl;

import com.taxedge.companyregistration.dto.request.CompanyDetailsRequest;
import com.taxedge.companyregistration.service.CompanyDetailsService;
import com.taxedge.companyregistration.service.CompanyRegistrationService;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class CompanyDetailsServiceImpl implements CompanyDetailsService {
    private final CompanyRegistrationService registrations;

    public CompanyDetailsServiceImpl(CompanyRegistrationService registrations) {
        this.registrations = registrations;
    }

    @Override
    public Map<String, Object> updateDetails(Long id, CompanyDetailsRequest request) {
        return registrations.updateDetails(id, request);
    }
}