package com.taxedge.companyregistration.dto.request;

import java.math.BigDecimal;

public record ShareholdingRequest(String person, Long numberOfShares, BigDecimal shareValue, BigDecimal percentage) {}