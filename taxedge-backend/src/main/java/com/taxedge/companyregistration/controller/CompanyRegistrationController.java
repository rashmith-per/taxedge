package com.taxedge.companyregistration.controller;

import com.taxedge.companyregistration.dto.CompanyRegistrationDto;
import com.taxedge.companyregistration.dto.request.CreateCompanyRegistrationRequest;
import com.taxedge.companyregistration.dto.response.CompanyRegistrationResponse;
import com.taxedge.companyregistration.dto.response.ReviewResponse;
import com.taxedge.companyregistration.dto.response.SubmissionResponse;
import com.taxedge.companyregistration.service.CompanyRegistrationService;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CompanyRegistrationController {
    private final CompanyRegistrationService service;

    public CompanyRegistrationController(CompanyRegistrationService service) {
        this.service = service;
    }

    @PostMapping("/api/v1/company-registrations")
    public ResponseEntity<CompanyRegistrationResponse> create(@RequestBody CreateCompanyRegistrationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @GetMapping("/api/v1/company-registrations")
    public List<CompanyRegistrationResponse> list() {
        return service.list();
    }

    @GetMapping("/api/v1/company-registrations/{id}")
    public ReviewResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping("/company-registration/apply")
    public SubmissionResponse apply(@RequestBody CompanyRegistrationDto.DraftRequest request) {
        return service.applyDraft(request);
    }

    @GetMapping("/company-registration/check-name")
    public Map<String, Object> checkName(@RequestParam String name) {
        return service.checkName(name);
    }
}