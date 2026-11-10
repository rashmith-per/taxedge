package com.taxedge.myapplications.gst.gstcompliance.controller;

import java.util.Collections;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.taxedge.myapplications.gst.gstcompliance.dto.GstComplianceMyApplicationResponseDto;
import com.taxedge.myapplications.gst.gstcompliance.service.GstComplianceMyApplicationsService;
import com.taxedge.security.jwt.JwtPrincipal;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping({"/api/v1/gst/my-applications/compliance", "/api/v1/my-applications/compliance"})
@RequiredArgsConstructor
@Slf4j
public class GstComplianceMyApplicationsController {

    private final GstComplianceMyApplicationsService gstComplianceMyApplicationsService;

    @GetMapping("/{custId}")
    public ResponseEntity<List<GstComplianceMyApplicationResponseDto>> getMyComplianceApplicationsByCustId(
            @PathVariable String custId,
            @AuthenticationPrincipal JwtPrincipal principal) {

        if (principal == null || principal.custId() == null || principal.custId().isBlank()) {
            log.warn("Unauthorized request to /api/v1/gst/my-applications/compliance/{}: Missing principal", custId);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authentication context");
        }

        if (!custId.equalsIgnoreCase(principal.custId())) {
            log.warn("Forbidden access: Customer {} attempted to view compliance for {}", principal.custId(), custId);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied: You can only view your own applications");
        }

        log.info("Fetching my-applications compliance for customer: {}", custId);
        List<GstComplianceMyApplicationResponseDto> response = gstComplianceMyApplicationsService.getMyComplianceApplications(custId);
        return ResponseEntity.ok(response != null ? response : Collections.emptyList());
    }

    @GetMapping
    public ResponseEntity<List<GstComplianceMyApplicationResponseDto>> getMyComplianceApplications(
            @AuthenticationPrincipal JwtPrincipal principal) {

        if (principal == null || principal.custId() == null || principal.custId().isBlank()) {
            log.warn("Unauthorized request to /api/v1/gst/my-applications/compliance: Missing principal");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authentication context");
        }

        String custId = principal.custId();
        log.info("Fetching my-applications compliance for customer: {}", custId);
        List<GstComplianceMyApplicationResponseDto> response = gstComplianceMyApplicationsService.getMyComplianceApplications(custId);
        return ResponseEntity.ok(response != null ? response : Collections.emptyList());
    }
}
