package com.taxedge.companyregistration.service;

import com.taxedge.companyregistration.dto.response.SubmissionResponse;

public interface SubmissionService {
    SubmissionResponse submit(Long registrationId);
}