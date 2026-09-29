package com.taxedge.loan.service;

import com.taxedge.loan.dto.BusinessLoanApplicationDto;

public interface BusinessLoanApplicationService {

    String saveApplication(BusinessLoanApplicationDto dto);

    String updateApplication(String id, BusinessLoanApplicationDto dto);

    BusinessLoanApplicationDto getApplication(String id);
}