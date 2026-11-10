package com.taxedge.myapplications.gst.controller;

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

import com.taxedge.myapplications.gst.dto.MyApplicationResponseDto;
import com.taxedge.myapplications.gst.service.MyApplicationsService;
import com.taxedge.security.jwt.JwtPrincipal;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping({"/api/v1/gst/my-applications", "/api/v1/my-applications"})
@RequiredArgsConstructor
@Slf4j
public class MyApplicationsController {

    private final MyApplicationsService myApplicationsService;

    /**
     * Get applications by custId path variable with Bearer Token authentication.
     * URL: GET /api/v1/gst/my-applications/{custId}
     */
    @GetMapping("/{custId}")
    public ResponseEntity<List<MyApplicationResponseDto>> getMyApplicationsByCustId(
            @PathVariable String custId,
            @AuthenticationPrincipal JwtPrincipal principal) {

        if (principal == null || principal.custId() == null || principal.custId().isBlank()) {
            log.warn("Unauthorized request to /api/v1/gst/my-applications/{}: Missing customer principal", custId);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authentication context");
        }

        // Customer identity check: Ensure authenticated customer only accesses their own records
        if (!custId.equalsIgnoreCase(principal.custId())) {
            log.warn("Forbidden access attempt: Customer {} tried to access applications for {}", principal.custId(), custId);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied: You can only view your own applications");
        }

        log.info("Fetching my-applications for customer: {}", custId);
        List<MyApplicationResponseDto> response = myApplicationsService.getMyApplications(custId);
        return ResponseEntity.ok(response != null ? response : Collections.emptyList());
    }

    /**
     * Get applications using authenticated customer principal from token.
     * URL: GET /api/v1/gst/my-applications
     */
    @GetMapping
    public ResponseEntity<List<MyApplicationResponseDto>> getMyApplications(
            @AuthenticationPrincipal JwtPrincipal principal) {

        if (principal == null || principal.custId() == null || principal.custId().isBlank()) {
            log.warn("Unauthorized request to my-applications: Missing customer principal");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authentication context");
        }

        String custId = principal.custId();
        log.info("Fetching my-applications for customer: {}", custId);
        List<MyApplicationResponseDto> response = myApplicationsService.getMyApplications(custId);
        return ResponseEntity.ok(response != null ? response : Collections.emptyList());
    }
}
