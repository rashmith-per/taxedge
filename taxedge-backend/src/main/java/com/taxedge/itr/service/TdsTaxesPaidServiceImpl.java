package com.taxedge.itr.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxedge.itr.Exception.ResourceNotFoundException;
import com.taxedge.itr.dto.TdsTaxesPaidDto;
import com.taxedge.itr.entity.RefundBankAccount;
import com.taxedge.itr.entity.TdsTaxesPaid;
import com.taxedge.itr.repository.RefundBankAccountRepository;
import com.taxedge.itr.repository.TdsTaxesPaidRepository;

@Service
@RequiredArgsConstructor
public class TdsTaxesPaidServiceImpl implements TdsTaxesPaidService {

    private final TdsTaxesPaidRepository repository;
    private final RefundBankAccountRepository bankAccountRepository;

    @Override
    @Transactional
    public String saveTaxesPaid(TdsTaxesPaidDto dto) {

        RefundBankAccount bankAccount = null;
        TdsTaxesPaid existing = null;
        if (dto.getTdsRefundId() != null && !dto.getTdsRefundId().trim().isEmpty()) {
            bankAccount = bankAccountRepository.findById(dto.getTdsRefundId())
                    .orElseThrow(() -> new RuntimeException("Refund bank account not found with ID: " + dto.getTdsRefundId()));
            existing = repository.findByRefundBankAccount_Id(dto.getTdsRefundId()).orElse(null);
        }

        TdsTaxesPaid entity = TdsTaxesPaid.builder()
                .id(existing != null ? existing.getId() : (dto.getId() != null ? dto.getId() : null))
                .refundBankAccount(bankAccount)
                .totalTdsDeducted(dto.getTotalTdsDeducted())
                .tcsAmount(dto.getTcsAmount())
                .advanceTax(dto.getAdvanceTax())
                .selfAssessmentTax(dto.getSelfAssessmentTax())
                .build();

        TdsTaxesPaid saved = repository.save(entity);

        return "Taxes paid saved successfully. ID: " + saved.getId();
    }

    @Override
    @Transactional
    public String updateTaxesPaid(Long id, TdsTaxesPaidDto dto) {

        TdsTaxesPaid existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("TDS record not found"));

        if (dto.getTdsRefundId() != null && !dto.getTdsRefundId().trim().isEmpty()) {
            RefundBankAccount bankAccount = bankAccountRepository.findById(dto.getTdsRefundId())
                    .orElseThrow(() -> new RuntimeException("Refund bank account not found with ID: " + dto.getTdsRefundId()));
            existing.setRefundBankAccount(bankAccount);
        }

        if (dto.getTotalTdsDeducted() != null) existing.setTotalTdsDeducted(dto.getTotalTdsDeducted());
        if (dto.getTcsAmount() != null) existing.setTcsAmount(dto.getTcsAmount());
        if (dto.getAdvanceTax() != null) existing.setAdvanceTax(dto.getAdvanceTax());
        if (dto.getSelfAssessmentTax() != null) existing.setSelfAssessmentTax(dto.getSelfAssessmentTax());

        repository.save(existing);

        return "Taxes paid updated successfully";
    }

    
    @Override
    public TdsTaxesPaidDto getTaxesPaid(String tdsRefundId) {
        TdsTaxesPaid e = repository.findByRefundBankAccount_Id(tdsRefundId)
                .orElseThrow(() -> new ResourceNotFoundException("Taxes paid not found"));

        return TdsTaxesPaidDto.builder()
                .id(e.getId())
                .tdsRefundId(e.getRefundBankAccount() != null ? e.getRefundBankAccount().getId() : null)
                .totalTdsDeducted(e.getTotalTdsDeducted())
                .tcsAmount(e.getTcsAmount())
                .advanceTax(e.getAdvanceTax())
                .selfAssessmentTax(e.getSelfAssessmentTax())
                .build();
    }
   
}