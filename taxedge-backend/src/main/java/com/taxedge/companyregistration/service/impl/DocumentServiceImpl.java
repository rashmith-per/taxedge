package com.taxedge.companyregistration.service.impl;

import com.taxedge.companyregistration.dto.response.DocumentResponse;
import com.taxedge.companyregistration.entity.CompanyRegistrationDocumentType;
import com.taxedge.companyregistration.service.CompanyRegistrationService;
import com.taxedge.companyregistration.service.DocumentService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DocumentServiceImpl implements DocumentService {
    private final CompanyRegistrationService registrations;

    public DocumentServiceImpl(CompanyRegistrationService registrations) {
        this.registrations = registrations;
    }

    @Override public DocumentResponse uploadDocument(Long id, CompanyRegistrationDocumentType type, MultipartFile file) { return registrations.uploadDocument(id, type, file); }
    @Override public List<DocumentResponse> documents(Long id) { return registrations.documents(id); }
    @Override public DocumentResponse document(Long id, Long documentId) { return registrations.document(id, documentId); }
    @Override public void deleteDocument(Long id, Long documentId) { registrations.deleteDocument(id, documentId); }
}