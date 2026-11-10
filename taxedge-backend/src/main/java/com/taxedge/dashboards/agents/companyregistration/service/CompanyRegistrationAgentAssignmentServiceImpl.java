package com.taxedge.dashboards.agents.companyregistration.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxedge.companyregistration.entity.CompanyDetails;
import com.taxedge.companyregistration.repository.CompanyDetailsRepository;
import com.taxedge.dashboards.auth.entity.AgentLogin;
import com.taxedge.dashboards.auth.repository.AgentLoginRepository;
import com.taxedge.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyRegistrationAgentAssignmentServiceImpl implements CompanyRegistrationAgentAssignmentService {

    private final CompanyDetailsRepository companyDetailsRepository;
    private final AgentLoginRepository agentLoginRepository;

    @Override
    @Transactional
    public String assignCompanyApplication(String id, Long agentId, String applicationType) {
        log.info("Assigning company application [{}] of type [{}] to agent [{}]", id, applicationType, agentId);

        return switch (applicationType) {
            case "COMPANY_REGISTRATION" -> {
                assignCompanyRegistration(id, agentId);
                yield "Company registration successfully assigned to agent.";
            }
            default -> throw new ResourceNotFoundException("Company application not found across supported services with ID: " + id);
        };
    }

    @Override
    @Transactional
    public void assignCompanyRegistration(String companyRegistrationId, Long agentId) {
        log.info("Assigning company registration [{}] to agent [{}]", companyRegistrationId, agentId);

        CompanyDetails company = companyDetailsRepository.findById(companyRegistrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Company registration not found with ID: " + companyRegistrationId));

        AgentLogin agent = agentLoginRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with ID: " + agentId));

        company.setAssignedAgent(agent);
        companyDetailsRepository.save(company);

        log.info("Successfully assigned company registration [{}] to agent ID [{}] ({})",
                companyRegistrationId, agent.getId(), agent.getFullName());
    }
}
