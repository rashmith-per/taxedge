package com.taxedge.companyregistration.dto.request;

import java.math.BigDecimal;

public record PaymentRequest(BigDecimal amount, BigDecimal governmentFee, BigDecimal professionalFee, BigDecimal totalAmount, String paymentStatus, String transactionId, String paymentGateway, String paymentMethod) {}