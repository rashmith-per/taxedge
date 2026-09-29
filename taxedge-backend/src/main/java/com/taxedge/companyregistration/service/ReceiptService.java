package com.taxedge.companyregistration.service;

import com.taxedge.companyregistration.dto.response.ReceiptResponse;

public interface ReceiptService {
    ReceiptResponse receipt(Long registrationId);
}