package com.taxedge.companyregistration.controller;

import com.taxedge.companyregistration.dto.request.LinkedRegistrationRequest;
import com.taxedge.companyregistration.service.LinkedRegistrationService;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/company-registrations/{id}/linked-registrations")
public class LinkedRegistrationController {
    private final LinkedRegistrationService service;

    public LinkedRegistrationController(LinkedRegistrationService service) {
        this.service = service;
    }

    @PutMapping
    public Map<String, Object> update(@PathVariable Long id, @RequestBody LinkedRegistrationRequest request) {
        return service.updateLinkedRegistrations(id, request);
    }

    @GetMapping
    public Map<String, Object> get(@PathVariable Long id) {
        return service.linkedRegistrations(id);
    }
}