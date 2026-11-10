package com.taxedge.dashboards.agents.itr.service;

public interface ItrAgentAssignmentService {

    String assignItrApplication(String id, Long agentId, String applicationType);

    void assignTdsRefund(String refundId, Long agentId);

    void assignItrFiling(String itrId, Long agentId);

    void assignRevisedItr(String revisedItrId, Long agentId);
}

