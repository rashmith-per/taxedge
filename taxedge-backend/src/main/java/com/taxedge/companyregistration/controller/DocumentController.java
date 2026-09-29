package com.taxedge.companyregistration.controller;

import com.taxedge.companyregistration.entity.CompanyRegistrationDocumentType;
import com.taxedge.companyregistration.dto.response.DocumentResponse;
import com.taxedge.companyregistration.service.DocumentService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/company-registrations/{id}/documents")
public class DocumentController {
    private final DocumentService service;

    public DocumentController(DocumentService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<DocumentResponse> upload(@PathVariable Long id, @RequestParam CompanyRegistrationDocumentType documentType, @RequestParam MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.uploadDocument(id, documentType, file));
    }

    @GetMapping
    public List<DocumentResponse> list(@PathVariable Long id) {
        return service.documents(id);
    }

    @GetMapping("/{documentId}")
    public DocumentResponse get(@PathVariable Long id, @PathVariable Long documentId) {
        return service.document(id, documentId);
    }

    @DeleteMapping("/{documentId}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @PathVariable Long documentId) {
        service.deleteDocument(id, documentId);
        return ResponseEntity.noContent().build();
    }
}