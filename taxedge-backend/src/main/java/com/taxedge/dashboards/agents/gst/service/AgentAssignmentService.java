package com.taxedge.dashboards.agents.gst.service;

public interface AgentAssignmentService {

    String assignGstApplication(String id, Long agentId, String applicationType);

    void assignGstRegistration(String businessGstId, Long agentId);

    void assignGstFiling(String gstfilingId, Long agentId);

    void assignGstCompliance(String complianceId, Long agentId);

    void assignAdditionalPlaceAmendment(String amendmentId, Long agentId);

    void assignBankAccountAmendment(String amendmentId, Long agentId);

    void assignContactAmendment(String amendmentId, Long agentId);

    void assignLegalNameAmendment(String amendmentId, Long agentId);

    void assignPrincipalPlaceAmendment(String amendmentId, Long agentId);

    void assignSignatoryAmendment(String amendmentId, Long agentId);
}

