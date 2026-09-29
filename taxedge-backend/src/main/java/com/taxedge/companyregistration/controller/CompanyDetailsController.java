package com.taxedge.companyregistration.controller;

import com.taxedge.companyregistration.dto.request.CompanyDetailsRequest;
import com.taxedge.companyregistration.service.CompanyDetailsService;
import java.util.Map;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/company-registrations/{id}/details")
public class CompanyDetailsController {
    private final CompanyDetailsService service;

    public CompanyDetailsController(CompanyDetailsService service) {
        this.service = service;
    }

    @PutMapping
    public Map<String, Object> update(@PathVariable Long id, @RequestBody CompanyDetailsRequest request) {
        return service.updateDetails(id, request);
    }
}