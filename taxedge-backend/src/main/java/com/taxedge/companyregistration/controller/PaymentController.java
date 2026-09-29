package com.taxedge.companyregistration.controller;

import com.taxedge.companyregistration.dto.request.PaymentRequest;
import com.taxedge.companyregistration.service.PaymentService;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/company-registrations/{id}/payment")
public class PaymentController {
    private final PaymentService service;

    public PaymentController(PaymentService service) {
        this.service = service;
    }

    @GetMapping
    public Map<String, Object> payment(@PathVariable Long id) {
        return service.payment(id);
    }

    @PostMapping
    public Map<String, Object> save(@PathVariable Long id, @RequestBody PaymentRequest request) {
        return service.savePayment(id, request);
    }
}