package com.taxedge.companyregistration.controller;

import com.taxedge.companyregistration.dto.request.RegisteredOfficeRequest;
import com.taxedge.companyregistration.service.RegisteredOfficeService;
import java.util.Map;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/company-registrations/{id}/registered-office")
public class RegisteredOfficeController {
    private final RegisteredOfficeService service;

    public RegisteredOfficeController(RegisteredOfficeService service) {
        this.service = service;
    }

    @PutMapping
    public Map<String, Object> update(@PathVariable Long id, @RequestBody RegisteredOfficeRequest request) {
        return service.updateOffice(id, request);
    }
}