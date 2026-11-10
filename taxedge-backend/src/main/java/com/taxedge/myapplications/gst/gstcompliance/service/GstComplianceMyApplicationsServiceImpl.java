package com.taxedge.myapplications.gst.gstcompliance.service;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.taxedge.gst.compliance.entity.GstCompliance;
import com.taxedge.gst.compliance.repository.GstComplianceRepository;
import com.taxedge.myapplications.gst.gstcompliance.dto.GstComplianceMyApplicationResponseDto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class GstComplianceMyApplicationsServiceImpl implements GstComplianceMyApplicationsService {

    private final GstComplianceRepository gstComplianceRepository;

    @Override
    @Transactional(readOnly = true)
    public List<GstComplianceMyApplicationResponseDto> getMyComplianceApplications(String custId) {
        if (!StringUtils.hasText(custId)) {
            log.warn("getMyComplianceApplications called with empty custId");
            return Collections.emptyList();
        }

        List<GstCompliance> compliances = gstComplianceRepository.findSubmittedByCustId(custId);
        return compliances.stream()
                .map(this::toResponseDto)
                .toList();
    }

    private GstComplianceMyApplicationResponseDto toResponseDto(GstCompliance compliance) {
        return GstComplianceMyApplicationResponseDto.builder()
                .complianceId(compliance.getComplinaceId())
                .gstin(compliance.getGstin())
                .applicationType("GST_COMPLIANCE")
                .status(compliance.getStatus())
                .assignedAgentId(compliance.getAssignedAgent() != null ? compliance.getAssignedAgent().getId() : null)
                .createdAt(compliance.getCreatedAt())
                .updatedAt(compliance.getUpdatedAt())
                .submittedAt(compliance.getSubmittedAt())
                .financialYear(compliance.getFinancialYear())
                .requestType(compliance.getRequestType())
                .gstr2bNumber(compliance.getGstr2bNumber())
                .noticeNumber(compliance.getNoticeNumber())
                .noticeIssueDate(compliance.getNoticeIssueDate())
                .replyDueDate(compliance.getReplyDueDate())
                .message(compliance.getMessage())
                .reconciliationFile1Uploaded(compliance.getReconciliationFile1() != null && compliance.getReconciliationFile1().length > 0)
                .reconciliationFile2Uploaded(compliance.getReconciliationFile2() != null && compliance.getReconciliationFile2().length > 0)
                .noticeFileUploaded(compliance.getNoticeFile() != null && compliance.getNoticeFile().length > 0)
                .build();
    }
}
