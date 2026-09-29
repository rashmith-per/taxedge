package com.taxedge.loan.service;

import com.taxedge.loan.dto.BusinessLoanProfileDto;

public interface BusinessLoanProfileService {

    String saveProfile(BusinessLoanProfileDto dto);

    String updateProfile(String loanApplicationId, BusinessLoanProfileDto dto);

    BusinessLoanProfileDto getProfile(String loanApplicationId);
}