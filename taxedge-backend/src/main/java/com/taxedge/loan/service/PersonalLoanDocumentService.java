package com.taxedge.loan.service;

import org.springframework.web.multipart.MultipartFile;

import com.taxedge.loan.dto.PersonalLoanDocumentDto;

public interface PersonalLoanDocumentService {

    String saveDocuments(String loanApplicationId,
                         MultipartFile panCardFile,
                         MultipartFile aadhaarCardFile,
                         MultipartFile addressProofFile,
                         MultipartFile photographFile,
                         MultipartFile bankStatementsFile,
                         MultipartFile salarySlipsFile);

    String updateDocuments(String loanApplicationId,
                           MultipartFile panCardFile,
                           MultipartFile aadhaarCardFile,
                           MultipartFile addressProofFile,
                           MultipartFile photographFile,
                           MultipartFile bankStatementsFile,
                           MultipartFile salarySlipsFile);

    PersonalLoanDocumentDto getDocuments(String loanApplicationId);

    byte[] downloadFile(String loanApplicationId, String fileType);
}
