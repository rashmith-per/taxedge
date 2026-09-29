package com.taxedge.companyregistration.service.impl;

import com.taxedge.companyregistration.dto.request.RegisteredOfficeRequest;
import com.taxedge.companyregistration.service.CompanyRegistrationService;
import com.taxedge.companyregistration.service.RegisteredOfficeService;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class RegisteredOfficeServiceImpl implements RegisteredOfficeService {
    private final CompanyRegistrationService registrations;

    public RegisteredOfficeServiceImpl(CompanyRegistrationService registrations) {
        this.registrations = registrations;
    }

    @Override
    public Map<String, Object> updateOffice(Long id, RegisteredOfficeRequest request) {
        return registrations.updateOffice(id, request);
    }
}