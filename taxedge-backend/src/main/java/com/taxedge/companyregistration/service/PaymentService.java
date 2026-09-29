package com.taxedge.companyregistration.service;

import com.taxedge.companyregistration.dto.request.PaymentRequest;
import java.util.Map;

public interface PaymentService {
    Map<String, Object> payment(Long registrationId);
    Map<String, Object> savePayment(Long registrationId, PaymentRequest request);
}