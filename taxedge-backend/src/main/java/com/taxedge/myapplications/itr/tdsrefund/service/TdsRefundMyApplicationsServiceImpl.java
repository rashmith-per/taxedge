package com.taxedge.myapplications.itr.tdsrefund.service;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.taxedge.itr.tdsrefund.entity.TdsRefund;
import com.taxedge.itr.tdsrefund.repository.TdsRefundRepository;
import com.taxedge.myapplications.itr.tdsrefund.dto.TdsRefundMyApplicationResponseDto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class TdsRefundMyApplicationsServiceImpl implements TdsRefundMyApplicationsService {

    private final TdsRefundRepository tdsRefundRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TdsRefundMyApplicationResponseDto> getMyTdsRefundApplications(String custId) {
        if (!StringUtils.hasText(custId)) {
            log.warn("getMyTdsRefundApplications called with empty custId");
            return Collections.emptyList();
        }

        List<TdsRefund> refunds = tdsRefundRepository.findSubmittedByCustId(custId);
        return refunds.stream()
                .map(this::toResponseDto)
                .toList();
    }

    private TdsRefundMyApplicationResponseDto toResponseDto(TdsRefund refund) {
        return TdsRefundMyApplicationResponseDto.builder()
                .tdsRefundId(refund.getId())
                .applicationType("TDS_REFUND")
                .status(refund.getStatus())
                .assignedAgentId(refund.getAssignedAgent() != null ? refund.getAssignedAgent().getId() : null)
                .createdAt(refund.getCreatedAt())
                .updatedAt(refund.getUpdatedAt())
                .submittedAt(refund.getSubmittedAt())
                .accountHolderName(refund.getAccountHolderName())
                .accountNumber(refund.getAccountNumber())
                .ifscCode(refund.getIfscCode())
                .bankName(refund.getBankName())
                .branchName(refund.getBranchName())
                .accountType(refund.getAccountType())
                .legalBusinessName(refund.getLegalBusinessName())
                .businessPan(refund.getBusinessPan())
                .aadhaarNumber(refund.getAadhaarNumber())
                .mobileNumber(refund.getMobileNumber())
                .businessPanDocumentUploaded(refund.getBusinessPanDocument() != null && refund.getBusinessPanDocument().length > 0)
                .aadhaarDocumentUploaded(refund.getAadhaarDocument() != null && refund.getAadhaarDocument().length > 0)
                .build();
    }
}
