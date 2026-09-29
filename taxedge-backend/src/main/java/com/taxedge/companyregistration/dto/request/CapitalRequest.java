package com.taxedge.companyregistration.dto.request;

import java.math.BigDecimal;

public record CapitalRequest(BigDecimal authorizedCapital, BigDecimal paidUpCapital, Long numberOfShares, BigDecimal faceValuePerShare) {}