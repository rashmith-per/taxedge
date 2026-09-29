package com.taxedge.companyregistration.service.impl;

import com.taxedge.companyregistration.dto.response.ReceiptResponse;
import com.taxedge.companyregistration.service.CompanyRegistrationService;
import com.taxedge.companyregistration.service.ReceiptService;
import org.springframework.stereotype.Service;

@Service
public class ReceiptServiceImpl implements ReceiptService {
    private final CompanyRegistrationService registrations;

    public ReceiptServiceImpl(CompanyRegistrationService registrations) {
        this.registrations = registrations;
    }

    @Override public ReceiptResponse receipt(Long id) { return registrations.receipt(id); }
}