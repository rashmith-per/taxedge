package com.taxedge.companyregistration.service.impl;

import com.taxedge.companyregistration.dto.request.PaymentRequest;
import com.taxedge.companyregistration.service.CompanyRegistrationService;
import com.taxedge.companyregistration.service.PaymentService;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class PaymentServiceImpl implements PaymentService {
    private final CompanyRegistrationService registrations;

    public PaymentServiceImpl(CompanyRegistrationService registrations) {
        this.registrations = registrations;
    }

    @Override public Map<String, Object> payment(Long id) { return registrations.payment(id); }
    @Override public Map<String, Object> savePayment(Long id, PaymentRequest request) { return registrations.savePayment(id, request); }
}