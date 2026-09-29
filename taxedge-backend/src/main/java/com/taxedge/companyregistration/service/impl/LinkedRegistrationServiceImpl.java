package com.taxedge.companyregistration.service.impl;

import com.taxedge.companyregistration.dto.request.LinkedRegistrationRequest;
import com.taxedge.companyregistration.service.CompanyRegistrationService;
import com.taxedge.companyregistration.service.LinkedRegistrationService;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class LinkedRegistrationServiceImpl implements LinkedRegistrationService {
    private final CompanyRegistrationService registrations;

    public LinkedRegistrationServiceImpl(CompanyRegistrationService registrations) {
        this.registrations = registrations;
    }

    @Override public Map<String, Object> updateLinkedRegistrations(Long id, LinkedRegistrationRequest request) { return registrations.updateLinkedRegistrations(id, request); }
    @Override public Map<String, Object> linkedRegistrations(Long id) { return registrations.linkedRegistrations(id); }
}