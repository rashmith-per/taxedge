package com.taxedge.companyregistration.service;

import com.taxedge.companyregistration.dto.response.DocumentResponse;
import com.taxedge.companyregistration.entity.CompanyRegistrationDocumentType;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface DocumentService {
    DocumentResponse uploadDocument(Long registrationId, CompanyRegistrationDocumentType documentType, MultipartFile file);
    List<DocumentResponse> documents(Long registrationId);
    DocumentResponse document(Long registrationId, Long documentId);
    void deleteDocument(Long registrationId, Long documentId);
}