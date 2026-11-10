package com.taxedge.myapplications.itr.reviseditr.service;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.taxedge.itr.reviseditr.entity.RevisedItr;
import com.taxedge.itr.reviseditr.entity.RevisedItrDetails;
import com.taxedge.itr.reviseditr.entity.RevisedItrDocument;
import com.taxedge.itr.reviseditr.entity.RevisionReasonEntity;
import com.taxedge.itr.reviseditr.repository.RevisedItrRepository;
import com.taxedge.myapplications.itr.reviseditr.dto.RevisedItrMyApplicationResponseDto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class RevisedItrMyApplicationsServiceImpl implements RevisedItrMyApplicationsService {

    private final RevisedItrRepository revisedItrRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RevisedItrMyApplicationResponseDto> getMyRevisedItrApplications(String custId) {
        if (!StringUtils.hasText(custId)) {
            log.warn("getMyRevisedItrApplications called with empty custId");
            return Collections.emptyList();
        }

        List<RevisedItr> revisedList = revisedItrRepository.findSubmittedByCustId(custId);
        return revisedList.stream()
                .map(this::toResponseDto)
                .toList();
    }

    private RevisedItrMyApplicationResponseDto toResponseDto(RevisedItr revisedItr) {
        RevisedItrDetails details = revisedItr.getDetails();
        RevisedItrDocument doc = revisedItr.getDocument();
        RevisionReasonEntity reason = revisedItr.getRevisionReason();

        return RevisedItrMyApplicationResponseDto.builder()
                .revisedItrId(revisedItr.getRevisedItrId())
                .applicationType("REVISED_ITR")
                .status(revisedItr.getStatus())
                .assignedAgentId(revisedItr.getAssignedAgent() != null ? revisedItr.getAssignedAgent().getId() : null)
                .createdAt(revisedItr.getCreatedAt())
                .updatedAt(revisedItr.getUpdatedAt())
                .submittedAt(revisedItr.getSubmittedAt())
                .assessmentYear(revisedItr.getAssessmentYear())
                .itrAcknowledgementNumber(revisedItr.getItrAcknowledgementNumber())
                .salaryBusinessIncome(details != null ? details.getSalaryBusinessIncome() : null)
                .otherIncome(details != null ? details.getOtherIncome() : null)
                .deduction80C(details != null ? details.getDeduction80C() : null)
                .deduction80D(details != null ? details.getDeduction80D() : null)
                .homeLoanInterest(details != null ? details.getHomeLoanInterest() : null)
                .taxableIncome(details != null ? details.getTaxableIncome() : null)
                .bankAccountForRefund(details != null ? details.getBankAccountForRefund() : null)
                .reason(reason != null && reason.getReason() != null ? reason.getReason().name() : null)
                .otherReason(reason != null ? reason.getOtherReason() : null)
                .panCardUploaded(doc != null && doc.getPanCard() != null && doc.getPanCard().length > 0)
                .aadhaarCardUploaded(doc != null && doc.getAadhaarCard() != null && doc.getAadhaarCard().length > 0)
                .form16Uploaded(doc != null && doc.getForm16Form16A() != null && doc.getForm16Form16A().length > 0)
                .aisTisStatementUploaded(doc != null && doc.getAisTisStatement() != null && doc.getAisTisStatement().length > 0)
                .bankStatementsUploaded(doc != null && doc.getBankStatements() != null && doc.getBankStatements().length > 0)
                .build();
    }
}
