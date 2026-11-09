package com.taxedge.myapplications.itr.itrfiling.service;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.taxedge.itr.filing.entity.ItrDocument;
import com.taxedge.itr.filing.entity.ItrFiling;
import com.taxedge.itr.filing.entity.SalaryIncome;
import com.taxedge.itr.filing.repository.ItrFilingRepository;
import com.taxedge.myapplications.itr.itrfiling.dto.ItrFilingMyApplicationResponseDto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ItrFilingMyApplicationsServiceImpl implements ItrFilingMyApplicationsService {

    private final ItrFilingRepository itrFilingRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ItrFilingMyApplicationResponseDto> getMyItrFilingApplications(String custId) {
        if (!StringUtils.hasText(custId)) {
            log.warn("getMyItrFilingApplications called with empty custId");
            return Collections.emptyList();
        }

        List<ItrFiling> filings = itrFilingRepository.findSubmittedByCustId(custId);
        return filings.stream()
                .map(this::toResponseDto)
                .toList();
    }

    private ItrFilingMyApplicationResponseDto toResponseDto(ItrFiling filing) {
        SalaryIncome salary = filing.getSalaryIncome();
        ItrDocument doc = (filing.getDocuments() != null && !filing.getDocuments().isEmpty())
                ? filing.getDocuments().get(0)
                : null;

        return ItrFilingMyApplicationResponseDto.builder()
                .itrId(filing.getItrId())
                .applicationType("ITR_FILING")
                .status(filing.getStatus())
                .assignedAgentId(filing.getAssignedAgent() != null ? filing.getAssignedAgent().getId() : null)
                .createdAt(filing.getCreatedAt())
                .updatedAt(filing.getUpdatedAt())
                .submittedAt(filing.getSubmittedAt())
                .assessmentYear(filing.getAssessmentYear())
                .residentialStatus(filing.getResidentialStatus())
                .filingType(filing.getFilingType())
                .bankName(filing.getBankName())
                .accountNumber(filing.getAccountNumber())
                .ifscCode(filing.getIfscCode())
                .incomeSource(salary != null ? salary.getIncomeSource() : null)
                .employerLegalName(salary != null ? salary.getEmployerLegalName() : null)
                .grossSalary(salary != null ? salary.getGrossSalary() : null)
                .exemptAllowances(salary != null ? salary.getExemptAllowances() : null)
                .tdsDeductedByEmployer(salary != null ? salary.getTdsDeductedByEmployer() : null)
                .form16Uploaded(doc != null && doc.getForm16PartAPartB() != null && doc.getForm16PartAPartB().length > 0)
                .form26asUploaded(doc != null && doc.getForm26as() != null && doc.getForm26as().length > 0)
                .aisTisUploaded(doc != null && doc.getAisTis() != null && doc.getAisTis().length > 0)
                .bankAccountStatementUploaded(doc != null && doc.getBankAccountStatement() != null && doc.getBankAccountStatement().length > 0)
                .salaryPayslipsUploaded(doc != null && doc.getSalaryPayslips() != null && doc.getSalaryPayslips().length > 0)
                .build();
    }
}
