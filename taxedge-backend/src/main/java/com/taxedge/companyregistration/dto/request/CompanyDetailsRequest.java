package com.taxedge.companyregistration.dto.request;

public record CompanyDetailsRequest(
        String industryCategory, String businessActivityDescription,
        String companyClass, String companyCategory, String companySubCategory,
        String primaryActivity, String nicCode, String secondaryActivity,
        String proposedName1, String proposedName2, String proposedName3,
        String nameSuffix, String nameAvailabilityStatus,
        String companyEmail, String companyMobile) {}