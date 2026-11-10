package com.taxedge.myapplications.gst.gstfiling.service;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.taxedge.gst.filing.entity.GstFiling;
import com.taxedge.gst.filing.entity.GstFilingDocuments;
import com.taxedge.gst.filing.repository.GstFilingRepository;
import com.taxedge.myapplications.gst.gstfiling.dto.GstFilingMyApplicationResponseDto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class GstFilingMyApplicationsServiceImpl implements GstFilingMyApplicationsService {

    private final GstFilingRepository gstFilingRepository;

    @Override
    @Transactional(readOnly = true)
    public List<GstFilingMyApplicationResponseDto> getMyFilingApplications(String custId) {
        if (!StringUtils.hasText(custId)) {
            log.warn("getMyFilingApplications called with empty custId");
            return Collections.emptyList();
        }

        List<GstFiling> filings = gstFilingRepository.findSubmittedByCustId(custId);
        return filings.stream()
                .map(this::toResponseDto)
                .toList();
    }

    private GstFilingMyApplicationResponseDto toResponseDto(GstFiling filing) {
        GstFilingDocuments docs = filing.getDocuments();

        return GstFilingMyApplicationResponseDto.builder()
                .gstfilingId(filing.getGstfilingId())
                .gstin(filing.getGstin())
                .applicationType("GST_FILING")
                .status(filing.getStatus())
                .assignedAgentId(filing.getAssignedAgent() != null ? filing.getAssignedAgent().getId() : null)
                .createdAt(filing.getCreatedAt())
                .updatedAt(filing.getUpdatedAt())
                .submittedAt(filing.getSubmittedAt())

                // Step 1: Return Details
                .financialYear(filing.getFinancialYear())
                .filingPeriod(filing.getFilingPeriod())
                .filingFrequency(filing.getFilingFrequency())
                .returnType(filing.getReturnType())
                .filingType(filing.getFilingType())
                .taxCalculationMethod(filing.getTaxCalculationMethod())
                .estimatedTaxableSales(filing.getEstimatedTaxableSales())
                .estimatedTaxablePurchases(filing.getEstimatedTaxablePurchases())
                .estimatedEligibleItc(filing.getEstimatedEligibleItc())

                // Step 2: Documents Uploaded Status
                .documentId(docs != null ? docs.getDocumentId() : null)
                .salesInvoiceUploaded(docs != null && docs.getSalesInvoice() != null && docs.getSalesInvoice().length > 0)
                .purchaseInvoicesUploaded(docs != null && docs.getPurchaseInvoices() != null && docs.getPurchaseInvoices().length > 0)
                .gstr2bItcStatementUploaded(docs != null && docs.getGstr2bItcStatement() != null && docs.getGstr2bItcStatement().length > 0)
                .creditNotesUploaded(docs != null && docs.getCreditNotes() != null && docs.getCreditNotes().length > 0)
                .debitNotesUploaded(docs != null && docs.getDebitNotes() != null && docs.getDebitNotes().length > 0)
                .eInvoiceDataUploaded(docs != null && docs.getEInvoiceData() != null && docs.getEInvoiceData().length > 0)
                .eWayBillDataUploaded(docs != null && docs.getEWayBillData() != null && docs.getEWayBillData().length > 0)
                .expenseInvoicesAndVouchersUploaded(docs != null && docs.getExpenseInvoicesAndVouchers() != null && docs.getExpenseInvoicesAndVouchers().length > 0)
                .bankStatementUploaded(docs != null && docs.getBankStatement() != null && docs.getBankStatement().length > 0)
                .previousGstReturnsUploaded(docs != null && docs.getPreviousGstReturns() != null && docs.getPreviousGstReturns().length > 0)
                .previousFilingAcknowledgementUploaded(docs != null && docs.getPreviousFilingAcknowledgement() != null && docs.getPreviousFilingAcknowledgement().length > 0)
                .otherSupportingDocumentsUploaded(docs != null && docs.getOtherSupportingDocuments() != null && docs.getOtherSupportingDocuments().length > 0)
                .build();
    }
}
