package com.taxedge.companyregistration.service.impl;

import com.taxedge.companyregistration.dto.response.SubmissionResponse;
import com.taxedge.companyregistration.service.CompanyRegistrationService;
import com.taxedge.companyregistration.service.SubmissionService;
import org.springframework.stereotype.Service;

@Service
public class SubmissionServiceImpl implements SubmissionService {
    private final CompanyRegistrationService registrations;

    public SubmissionServiceImpl(CompanyRegistrationService registrations) {
        this.registrations = registrations;
    }

    @Override public SubmissionResponse submit(Long id) { return registrations.submit(id); }
}