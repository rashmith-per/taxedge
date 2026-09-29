package com.taxedge.companyregistration.controller;

import com.taxedge.companyregistration.service.ApplicationTrackingService;
import com.taxedge.companyregistration.dto.response.TrackingResponse;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ApplicationTrackingController {
    private final ApplicationTrackingService service;

    public ApplicationTrackingController(ApplicationTrackingService service) {
        this.service = service;
    }

    @GetMapping("/api/v1/company-registrations/{id}/tracking")
    public List<TrackingResponse> tracking(@PathVariable Long id) {
        return service.tracking(id);
    }

    @GetMapping("/company-registration/status/{applicationId}")
    public Map<String, Object> status(@PathVariable Long applicationId) {
        return service.status(applicationId);
    }
}