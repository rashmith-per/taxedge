package com.taxedge.companyregistration.controller;

import com.taxedge.companyregistration.dto.response.SubmissionResponse;
import com.taxedge.companyregistration.service.SubmissionService;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/company-registrations/{id}/submit")
public class SubmissionController {
    private final SubmissionService service;

    public SubmissionController(SubmissionService service) {
        this.service = service;
    }

    @PostMapping
    public SubmissionResponse submit(@PathVariable Long id) {
        return service.submit(id);
    }
}