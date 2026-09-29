package com.taxedge.companyregistration.controller;

import com.taxedge.companyregistration.service.ReceiptService;
import com.taxedge.companyregistration.dto.response.ReceiptResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/company-registrations/{id}/receipt")
public class ReceiptController {
    private final ReceiptService service;

    public ReceiptController(ReceiptService service) {
        this.service = service;
    }

    @GetMapping
    public ReceiptResponse receipt(@PathVariable Long id) {
        return service.receipt(id);
    }
}