package com.taxedge.companyregistration.service.impl;

import com.taxedge.companyregistration.dto.response.ReviewResponse;
import com.taxedge.companyregistration.service.CompanyRegistrationService;
import com.taxedge.companyregistration.service.ReviewService;
import org.springframework.stereotype.Service;

@Service
public class ReviewServiceImpl implements ReviewService {
    private final CompanyRegistrationService registrations;

    public ReviewServiceImpl(CompanyRegistrationService registrations) {
        this.registrations = registrations;
    }

    @Override public ReviewResponse review(Long id) { return registrations.review(id); }
}