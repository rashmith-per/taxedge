package com.taxedge.dashboards.agents.companyregistration.service;

public interface CompanyRegistrationAgentAssignmentService {

    String assignCompanyApplication(String id, Long agentId, String applicationType);

    void assignCompanyRegistration(String companyRegistrationId, Long agentId);
}
