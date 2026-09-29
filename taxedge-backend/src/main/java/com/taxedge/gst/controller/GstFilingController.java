package com.taxedge.gst.controller;

import java.io.IOException;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.taxedge.gst.dto.GstFilingDto;
import com.taxedge.gst.dto.GstFilingDocumentsDto;
import com.taxedge.gst.entity.GstFiling;
import com.taxedge.gst.service.GstFilingService;
import com.taxedge.gst.service.GstFilingDocumentsService;

@RestController
@RequestMapping("/api/v1/gst/filing")
@RequiredArgsConstructor
public class GstFilingController {

    private final GstFilingService gstFilingService;
    private final GstFilingDocumentsService documentsService;

    // ==========================================
    // 1. GST FILING ENDPOINTS
    // ==========================================

    @PostMapping("/create")
    public ResponseEntity<String> createFiling(@RequestBody GstFilingDto gstFilingDto) {
        String result = gstFilingService.createFiling(gstFilingDto);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @GetMapping("/{gstin}")
    public ResponseEntity<List<GstFiling>> getFilingsByGstin(@PathVariable String gstin) {
        List<GstFiling> filings = gstFilingService.getFilingsByGstin(gstin);
        return ResponseEntity.ok(filings);
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateFiling(@PathVariable String id, @RequestBody GstFilingDto gstFilingDto) {
        String result = gstFilingService.updateFiling(id, gstFilingDto);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteFiling(@PathVariable String id) {
        String result = gstFilingService.deleteFiling(id);
        return ResponseEntity.ok(result);
    }

    // ==========================================
    // 2. GST FILING DOCUMENTS ENDPOINTS
    // ==========================================

    @PostMapping("/documents/upload")
    public ResponseEntity<String> uploadDocument(
            @RequestParam("filingId") String filingId,
            @RequestParam("documentType") String documentType,
            @RequestParam("file") MultipartFile file) throws IOException {
        String result = documentsService.uploadDocument(filingId, documentType, file);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @GetMapping("/documents/{filingId}")
    public ResponseEntity<List<GstFilingDocumentsDto>> getDocuments(@PathVariable String filingId) {
        List<GstFilingDocumentsDto> documents = documentsService.getDocuments(filingId);
        return ResponseEntity.ok(documents);
    }

    @PutMapping("/documents/{filingId}/{id}")
    public ResponseEntity<String> updateDocument(
            @PathVariable String filingId,
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        String result = documentsService.updateDocument(filingId, id, file);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/documents/{filingId}/{id}")
    public ResponseEntity<String> deleteDocument(
            @PathVariable String filingId,
            @PathVariable Long id) {
        String result = documentsService.deleteDocument(filingId, id);
        return ResponseEntity.ok(result);
    }
}