package com.taxedge.loan.service;

import com.taxedge.loan.dto.BusinessLoanBankingDto;

public interface BusinessLoanBankingService {

    String saveBanking(BusinessLoanBankingDto dto);

    String updateBanking(String loanApplicationId, BusinessLoanBankingDto dto);

    BusinessLoanBankingDto getBanking(String loanApplicationId);
}