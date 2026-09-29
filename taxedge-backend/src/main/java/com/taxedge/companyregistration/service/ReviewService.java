package com.taxedge.companyregistration.service;

import com.taxedge.companyregistration.dto.response.ReviewResponse;

public interface ReviewService {
    ReviewResponse review(Long registrationId);
}