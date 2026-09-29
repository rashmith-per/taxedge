package com.taxedge.loan.service;

import com.taxedge.loan.dto.BusinessLoanDocumentDto;

public interface BusinessLoanDocumentService {

    String saveDocuments(BusinessLoanDocumentDto dto);

    String updateDocuments(String loanApplicationId, BusinessLoanDocumentDto dto);

    BusinessLoanDocumentDto getDocuments(String loanApplicationId);
}
