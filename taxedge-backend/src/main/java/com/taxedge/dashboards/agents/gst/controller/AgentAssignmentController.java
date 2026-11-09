package com.taxedge.dashboards.agents.gst.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.taxedge.dashboards.agents.companyregistration.service.CompanyRegistrationAgentAssignmentService;
import com.taxedge.dashboards.agents.gst.dto.AssignAgentRequest;
import com.taxedge.dashboards.agents.gst.service.AgentAssignmentService;
import com.taxedge.dashboards.agents.itr.service.ItrAgentAssignmentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/ca-manager")
@RequiredArgsConstructor
public class AgentAssignmentController {

    private final AgentAssignmentService agentAssignmentService;
    private final ItrAgentAssignmentService itrAgentAssignmentService;
    private final CompanyRegistrationAgentAssignmentService companyRegistrationAgentAssignmentService;

    @PutMapping("/assign")
    public ResponseEntity<String> assignAgent(
            @Valid @RequestBody AssignAgentRequest request,
            @RequestParam(value = "RegisterationType", required = false) String RegisterationType,
            @RequestParam(value = "registrationType", required = false) String registrationType) {

        log.info("REST request to assign application [{}] (type: [{}]) to agent [{}]",
                request.getApplicationId(), request.getApplicationType(), request.getAgentId());

       
        String message = switch (registrationType) {
            case "GST" -> agentAssignmentService.assignGstApplication(
                    request.getApplicationId(), request.getAgentId(), request.getApplicationType());
            case "ITR" -> itrAgentAssignmentService.assignItrApplication(
                    request.getApplicationId(), request.getAgentId(), request.getApplicationType());
            case "COMPANY" -> companyRegistrationAgentAssignmentService.assignCompanyApplication(
                    request.getApplicationId(), request.getAgentId(), request.getApplicationType());
            default -> throw new IllegalArgumentException("Unsupported registration type: " + registrationType);
        };

        return ResponseEntity.ok(message);
    }

   
}
