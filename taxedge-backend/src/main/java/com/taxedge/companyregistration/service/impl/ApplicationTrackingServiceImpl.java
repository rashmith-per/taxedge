package com.taxedge.companyregistration.service.impl;

import com.taxedge.companyregistration.dto.response.TrackingResponse;
import com.taxedge.companyregistration.service.ApplicationTrackingService;
import com.taxedge.companyregistration.service.CompanyRegistrationService;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class ApplicationTrackingServiceImpl implements ApplicationTrackingService {
    private final CompanyRegistrationService registrations;

    public ApplicationTrackingServiceImpl(CompanyRegistrationService registrations) {
        this.registrations = registrations;
    }

    @Override public List<TrackingResponse> tracking(Long id) { return registrations.tracking(id); }
    @Override public Map<String, Object> status(Long id) { return registrations.status(id); }
}