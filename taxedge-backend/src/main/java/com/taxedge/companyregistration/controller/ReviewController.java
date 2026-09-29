package com.taxedge.companyregistration.controller;

import com.taxedge.companyregistration.dto.response.ReviewResponse;
import com.taxedge.companyregistration.service.ReviewService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/company-registrations/{id}/review")
public class ReviewController {
    private final ReviewService service;

    public ReviewController(ReviewService service) {
        this.service = service;
    }

    @GetMapping
    public ReviewResponse review(@PathVariable Long id) {
        return service.review(id);
    }
}