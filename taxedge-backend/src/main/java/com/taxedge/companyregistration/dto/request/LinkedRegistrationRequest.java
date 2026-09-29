package com.taxedge.companyregistration.dto.request;

public record LinkedRegistrationRequest(boolean pan, boolean tan, boolean gst, boolean esic, boolean epfo, boolean professionalTax, boolean bankAccount) {}