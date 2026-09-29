package com.taxedge.companyregistration.controller;

import com.taxedge.companyregistration.dto.request.CapitalRequest;
import com.taxedge.companyregistration.dto.request.ShareholdingRequest;
import com.taxedge.companyregistration.service.CapitalService;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/company-registrations/{id}")
public class CapitalController {
    private final CapitalService service;

    public CapitalController(CapitalService service) {
        this.service = service;
    }

    @PutMapping("/capital")
    public Map<String, Object> updateCapital(@PathVariable Long id, @RequestBody CapitalRequest request) {
        return service.updateCapital(id, request);
    }

    @GetMapping("/shareholdings")
    public List<Map<String, Object>> shareholdings(@PathVariable Long id) {
        return service.shareholdings(id);
    }

    @PostMapping("/shareholdings")
    public ResponseEntity<Map<String, Object>> addShareholding(@PathVariable Long id, @RequestBody ShareholdingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.addShareholding(id, request));
    }

    @PutMapping("/shareholdings/{shareholdingId}")
    public Map<String, Object> updateShareholding(@PathVariable Long id, @PathVariable Long shareholdingId, @RequestBody ShareholdingRequest request) {
        return service.updateShareholding(id, shareholdingId, request);
    }

    @DeleteMapping("/shareholdings/{shareholdingId}")
    public ResponseEntity<Void> deleteShareholding(@PathVariable Long id, @PathVariable Long shareholdingId) {
        service.deleteShareholding(id, shareholdingId);
        return ResponseEntity.noContent().build();
    }
}