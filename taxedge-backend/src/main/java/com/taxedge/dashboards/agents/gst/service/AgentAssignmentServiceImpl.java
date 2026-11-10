package com.taxedge.dashboards.agents.gst.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxedge.dashboards.auth.entity.AgentLogin;
import com.taxedge.dashboards.auth.repository.AgentLoginRepository;
import com.taxedge.exception.ResourceNotFoundException;
import com.taxedge.gst.amendment.entity.AdditionalPlaceAmendmentEntity;
import com.taxedge.gst.amendment.entity.BankAccountAmendmentEntity;
import com.taxedge.gst.amendment.entity.ContactAmendmentEntity;
import com.taxedge.gst.amendment.entity.LegalNameAmendmentEntity;
import com.taxedge.gst.amendment.entity.PrincipalPlaceAmendmentEntity;
import com.taxedge.gst.amendment.entity.SignatoryAmendmentEntity;
import com.taxedge.gst.amendment.repository.AdditionalPlaceAmendmentRepository;
import com.taxedge.gst.amendment.repository.BankAccountAmendmentRepository;
import com.taxedge.gst.amendment.repository.ContactAmendmentRepository;
import com.taxedge.gst.amendment.repository.LegalNameAmendmentRepository;
import com.taxedge.gst.amendment.repository.PrincipalPlaceAmendmentRepository;
import com.taxedge.gst.amendment.repository.SignatoryAmendmentRepository;
import com.taxedge.gst.compliance.entity.GstCompliance;
import com.taxedge.gst.compliance.repository.GstComplianceRepository;
import com.taxedge.gst.filing.entity.GstFiling;
import com.taxedge.gst.filing.repository.GstFilingRepository;
import com.taxedge.gst.registration.entity.Business;
import com.taxedge.gst.registration.repository.BusinessRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AgentAssignmentServiceImpl implements AgentAssignmentService {

    private final BusinessRepository businessRepository;
    private final GstFilingRepository gstFilingRepository;
    private final GstComplianceRepository gstComplianceRepository;
    private final AdditionalPlaceAmendmentRepository additionalPlaceAmendmentRepository;
    private final BankAccountAmendmentRepository bankAccountAmendmentRepository;
    private final ContactAmendmentRepository contactAmendmentRepository;
    private final LegalNameAmendmentRepository legalNameAmendmentRepository;
    private final PrincipalPlaceAmendmentRepository principalPlaceAmendmentRepository;
    private final SignatoryAmendmentRepository signatoryAmendmentRepository;
    private final AgentLoginRepository agentLoginRepository;

    @Override
    @Transactional
    public String assignGstApplication(String id, Long agentId, String applicationType) {
        log.info("Assigning application [{}] of type [{}] to agent [{}]", id, applicationType, agentId);


        return switch (applicationType) {
            case "GST_REGISTRATION" -> {
                assignGstRegistration(id, agentId);
                yield "GST registration successfully assigned to agent.";
            }
            case "GST_FILING" -> {
                assignGstFiling(id, agentId);
                yield "GST filing successfully assigned to agent.";
            }
            case "GST_COMPLIANCE" -> {
                assignGstCompliance(id, agentId);
                yield "GST compliance successfully assigned to agent.";
            }
            case "ADDITIONAL_PLACE_AMENDMENT" -> {
                assignAdditionalPlaceAmendment(id, agentId);
                yield "Additional place amendment successfully assigned to agent.";
            }
            case "BANK_ACCOUNT_AMENDMENT" -> {
                assignBankAccountAmendment(id, agentId);
                yield "Bank account amendment successfully assigned to agent.";
            }
            case "CONTACT_AMENDMENT" -> {
                assignContactAmendment(id, agentId);
                yield "Contact amendment successfully assigned to agent.";
            }
            case "LEGAL_NAME_AMENDMENT" -> {
                assignLegalNameAmendment(id, agentId);
                yield "Legal name amendment successfully assigned to agent.";
            }
            case "PRINCIPAL_PLACE_AMENDMENT" -> {
                assignPrincipalPlaceAmendment(id, agentId);
                yield "Principal place amendment successfully assigned to agent.";
            }
            case "SIGNATORY_AMENDMENT" -> {
                assignSignatoryAmendment(id, agentId);
                yield "Signatory amendment successfully assigned to agent.";
            }
            default -> throw new ResourceNotFoundException("Application not found across supported services with ID: " + id);
        };
    }

    
    @Override
    @Transactional
    public void assignGstRegistration(String businessGstId, Long agentId) {
        log.info("Assigning GST registration [{}] to agent [{}]", businessGstId, agentId);

        Business business = businessRepository.findById(businessGstId)
                .orElseThrow(() -> new ResourceNotFoundException("GST registration not found with ID: " + businessGstId));

        AgentLogin agent = agentLoginRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with ID: " + agentId));

        business.setAssignedAgent(agent);
        businessRepository.save(business);

        log.info("Successfully assigned GST registration [{}] to agent ID [{}] ({})",
                businessGstId, agent.getId(), agent.getFullName());
    }

    @Override
    @Transactional
    public void assignGstFiling(String gstfilingId, Long agentId) {
        log.info("Assigning GST filing [{}] to agent [{}]", gstfilingId, agentId);

        GstFiling gstFiling = gstFilingRepository.findById(gstfilingId)
                .orElseThrow(() -> new ResourceNotFoundException("GST filing not found with ID: " + gstfilingId));

        AgentLogin agent = agentLoginRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with ID: " + agentId));

        gstFiling.setAssignedAgent(agent);
        gstFilingRepository.save(gstFiling);

        log.info("Successfully assigned GST filing [{}] to agent ID [{}] ({})",
                gstfilingId, agent.getId(), agent.getFullName());
    }

    @Override
    @Transactional
    public void assignGstCompliance(String complianceId, Long agentId) {
        log.info("Assigning GST compliance [{}] to agent [{}]", complianceId, agentId);

        GstCompliance compliance = gstComplianceRepository.findById(complianceId)
                .orElseThrow(() -> new ResourceNotFoundException("GST compliance not found with ID: " + complianceId));

        AgentLogin agent = agentLoginRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with ID: " + agentId));

        compliance.setAssignedAgent(agent);
        gstComplianceRepository.save(compliance);

        log.info("Successfully assigned GST compliance [{}] to agent ID [{}] ({})",
                complianceId, agent.getId(), agent.getFullName());
    }

    @Override
    @Transactional
    public void assignAdditionalPlaceAmendment(String amendmentId, Long agentId) {
        log.info("Assigning additional place amendment [{}] to agent [{}]", amendmentId, agentId);

        AdditionalPlaceAmendmentEntity amendment = additionalPlaceAmendmentRepository.findById(amendmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Additional place amendment not found with ID: " + amendmentId));

        AgentLogin agent = agentLoginRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with ID: " + agentId));

        amendment.setAssignedAgent(agent);
        additionalPlaceAmendmentRepository.save(amendment);

        log.info("Successfully assigned additional place amendment [{}] to agent ID [{}] ({})",
                amendmentId, agent.getId(), agent.getFullName());
    }

    @Override
    @Transactional
    public void assignBankAccountAmendment(String amendmentId, Long agentId) {
        log.info("Assigning bank account amendment [{}] to agent [{}]", amendmentId, agentId);

        BankAccountAmendmentEntity amendment = bankAccountAmendmentRepository.findById(amendmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Bank account amendment not found with ID: " + amendmentId));

        AgentLogin agent = agentLoginRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with ID: " + agentId));

        amendment.setAssignedAgent(agent);
        bankAccountAmendmentRepository.save(amendment);

        log.info("Successfully assigned bank account amendment [{}] to agent ID [{}] ({})",
                amendmentId, agent.getId(), agent.getFullName());
    }

    @Override
    @Transactional
    public void assignContactAmendment(String amendmentId, Long agentId) {
        log.info("Assigning contact amendment [{}] to agent [{}]", amendmentId, agentId);

        ContactAmendmentEntity amendment = contactAmendmentRepository.findById(amendmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact amendment not found with ID: " + amendmentId));

        AgentLogin agent = agentLoginRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with ID: " + agentId));

        amendment.setAssignedAgent(agent);
        contactAmendmentRepository.save(amendment);

        log.info("Successfully assigned contact amendment [{}] to agent ID [{}] ({})",
                amendmentId, agent.getId(), agent.getFullName());
    }

    @Override
    @Transactional
    public void assignLegalNameAmendment(String amendmentId, Long agentId) {
        log.info("Assigning legal name amendment [{}] to agent [{}]", amendmentId, agentId);

        LegalNameAmendmentEntity amendment = legalNameAmendmentRepository.findById(amendmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Legal name amendment not found with ID: " + amendmentId));

        AgentLogin agent = agentLoginRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with ID: " + agentId));

        amendment.setAssignedAgent(agent);
        legalNameAmendmentRepository.save(amendment);

        log.info("Successfully assigned legal name amendment [{}] to agent ID [{}] ({})",
                amendmentId, agent.getId(), agent.getFullName());
    }

    @Override
    @Transactional
    public void assignPrincipalPlaceAmendment(String amendmentId, Long agentId) {
        log.info("Assigning principal place amendment [{}] to agent [{}]", amendmentId, agentId);

        PrincipalPlaceAmendmentEntity amendment = principalPlaceAmendmentRepository.findById(amendmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Principal place amendment not found with ID: " + amendmentId));

        AgentLogin agent = agentLoginRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with ID: " + agentId));

        amendment.setAssignedAgent(agent);
        principalPlaceAmendmentRepository.save(amendment);

        log.info("Successfully assigned principal place amendment [{}] to agent ID [{}] ({})",
                amendmentId, agent.getId(), agent.getFullName());
    }

    @Override
    @Transactional
    public void assignSignatoryAmendment(String amendmentId, Long agentId) {
        log.info("Assigning signatory amendment [{}] to agent [{}]", amendmentId, agentId);

        SignatoryAmendmentEntity amendment = signatoryAmendmentRepository.findById(amendmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Signatory amendment not found with ID: " + amendmentId));

        AgentLogin agent = agentLoginRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with ID: " + agentId));

        amendment.setAssignedAgent(agent);
        signatoryAmendmentRepository.save(amendment);

        log.info("Successfully assigned signatory amendment [{}] to agent ID [{}] ({})",
                amendmentId, agent.getId(), agent.getFullName());
    }
}

