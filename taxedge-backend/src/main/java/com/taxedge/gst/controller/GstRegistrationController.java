package com.taxedge.gst.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

import com.taxedge.gst.dto.BusinessDto;
import com.taxedge.gst.dto.DocumentsDto;
import com.taxedge.gst.service.BusinessService;
import com.taxedge.gst.service.DocumentsService;

@RestController
@RequestMapping("/api/v1/gst")
@RequiredArgsConstructor
public class GstRegistrationController {

    private final BusinessService businessService;
    private final DocumentsService documentsService;

    // ==========================================
    // 1. BUSINESS REGISTRATION ENDPOINTS
    // ==========================================

    @GetMapping("/business/{gstId}")
    public ResponseEntity<BusinessDto> getBusiness(@PathVariable String gstId) {
        BusinessDto business = businessService.getBusinessId(gstId);
        return ResponseEntity.ok(business);
    }

    @PostMapping("/business/register")
    public ResponseEntity<String> registerBusiness(@RequestBody BusinessDto businessDto) {
        String result = businessService.registerBusiness(businessDto);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @PutMapping("/business/update/{gstId}")
    public ResponseEntity<String> updateBusiness(
            @PathVariable String gstId,
            @RequestBody BusinessDto businessDto) {
        String result = businessService.updateBusiness(gstId, businessDto);
        return ResponseEntity.ok(result);
    }

    // ==========================================
    // 2. REGISTRATION DOCUMENTS ENDPOINTS
    // ==========================================

    @PostMapping(value = "/documents/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadFile(
            @RequestParam("gstId") String gstId,
            @RequestParam("documentType") String documentType,
            @RequestParam(value = "addressProofType", required = false) String addressProofType,
            @RequestParam("file") MultipartFile file) throws IOException {

        String result = documentsService.uploadFile(gstId, documentType, addressProofType, file);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @GetMapping("/documents/{gstId}")
    public ResponseEntity<List<DocumentsDto>> getDocumentsByGstId(
            @PathVariable String gstId) {

        List<DocumentsDto> documents = documentsService.getDocumentsByGstId(gstId);
        return ResponseEntity.ok(documents);
    }

    @PutMapping("/documents/{gstId}/{id}")
    public ResponseEntity<String> updateFile(
            @PathVariable String gstId,
            @PathVariable Long id,
            @RequestParam(value = "addressProofType", required = false) String addressProofType,
            @RequestParam("file") MultipartFile file) throws IOException {

        String result = documentsService.updateFile(gstId, id, addressProofType, file);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/documents/{gstId}/{id}")
    public ResponseEntity<String> deleteFile(
            @PathVariable String gstId,
            @PathVariable Long id) {

        String result = documentsService.deleteFile(gstId, id);
        return ResponseEntity.ok(result);
    }
}

