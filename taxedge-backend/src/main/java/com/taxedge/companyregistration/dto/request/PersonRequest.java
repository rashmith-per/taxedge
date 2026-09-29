package com.taxedge.companyregistration.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PersonRequest(
        String id, String personType, String name, String pan, String aadhaar, LocalDate dob,
        String fatherName, String gender, String nationality, String placeOfBirth,
        String occupation, String educationalQualification, String designation, String category,
        String email, String phone, Boolean hasDin, String din, Boolean hasDsc,
        BigDecimal sharesPercentage, String residentialAddress, Boolean isResidentInIndia,
        String addressLine1, String addressLine2, String city, String district, String state,
        String pinCode, Boolean sameAsPermanentAddress, String presentAddressLine1,
        String presentAddressLine2, String presentCity, String presentDistrict,
        String presentState, String presentPincode, Long numberOfShares,
        BigDecimal amountSubscribed, BigDecimal contributionAmount,
        BigDecimal profitSharePercentage, BigDecimal capitalContribution,
        BigDecimal profitSharingRatio, String relationship,
        String identityProofDocName, String residentialAddressProofDocName) {}