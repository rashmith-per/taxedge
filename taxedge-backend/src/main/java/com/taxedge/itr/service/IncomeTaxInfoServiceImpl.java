package com.taxedge.itr.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxedge.itr.Exception.ResourceNotFoundException;
import com.taxedge.itr.dto.IncomeTaxInfoDto;
import com.taxedge.itr.entity.IncomeTaxInfo;
import com.taxedge.itr.repository.IncomeTaxInfoRepository;
import com.taxedge.itr.repository.RefundBankAccountRepository;

@Service
@RequiredArgsConstructor
public class IncomeTaxInfoServiceImpl implements IncomeTaxInfoService {

    private final IncomeTaxInfoRepository repository;
    private final RefundBankAccountRepository bankAccountRepository;

    @Override
    @Transactional
    public String saveIncomeTaxInfo(IncomeTaxInfoDto dto) {

        com.taxedge.itr.entity.RefundBankAccount bankAccount = null;
        IncomeTaxInfo existing = null;
        if (dto.getTdsRefundId() != null && !dto.getTdsRefundId().trim().isEmpty()) {
            bankAccount = bankAccountRepository.findById(dto.getTdsRefundId())
                    .orElseThrow(() -> new RuntimeException("Refund bank account not found with ID: " + dto.getTdsRefundId()));
            existing = repository.findByRefundBankAccount_Id(dto.getTdsRefundId()).orElse(null);
        }

        IncomeTaxInfo entity = IncomeTaxInfo.builder()
                .id(existing != null ? existing.getId() : (dto.getId() != null ? dto.getId() : null))
                .createdAt(existing != null ? existing.getCreatedAt() : null)
                .refundBankAccount(bankAccount)
                .salaryIncome(dto.getSalaryIncome())
                .otherIncome(dto.getOtherIncome())
                .interestIncome(dto.getInterestIncome())
                .rentalIncome(dto.getRentalIncome())
                .municipalTaxesPaid(dto.getMunicipalTaxesPaid())
                .shortTermCapitalGains(dto.getShortTermCapitalGains())
                .longTermCapitalGains(dto.getLongTermCapitalGains())
                .grossTurnover(dto.getGrossTurnover())
                .netBusinessProfit(dto.getNetBusinessProfit())
                .homeLoanInterestSec24b(dto.getHomeLoanInterestSec24b())
                .deductions80C(dto.getDeductions80C())
                .deductions80D(dto.getDeductions80D())
                .build();

        IncomeTaxInfo saved = repository.save(entity);

        return "Income and tax information saved successfully. ID: " + saved.getId();
    }

    @Override
    @Transactional
    public String updateIncomeTaxInfo(Long id, IncomeTaxInfoDto dto) {

        IncomeTaxInfo existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Income tax info not found"));

        com.taxedge.itr.entity.RefundBankAccount bankAccount = existing.getRefundBankAccount();
        if (dto.getTdsRefundId() != null && !dto.getTdsRefundId().trim().isEmpty()) {
            bankAccount = bankAccountRepository.findById(dto.getTdsRefundId())
                    .orElseThrow(() -> new RuntimeException("Refund bank account not found with ID: " + dto.getTdsRefundId()));
        }

        IncomeTaxInfo updated = IncomeTaxInfo.builder()
                .id(existing.getId())                                   // same id -> UPDATE
                .createdAt(existing.getCreatedAt())                     // keep original timestamp
                .refundBankAccount(bankAccount)                          // updated or existing link
                .salaryIncome(dto.getSalaryIncome())
                .otherIncome(dto.getOtherIncome())
                .interestIncome(dto.getInterestIncome())
                .rentalIncome(dto.getRentalIncome())
                .municipalTaxesPaid(dto.getMunicipalTaxesPaid())
                .shortTermCapitalGains(dto.getShortTermCapitalGains())
                .longTermCapitalGains(dto.getLongTermCapitalGains())
                .grossTurnover(dto.getGrossTurnover())
                .netBusinessProfit(dto.getNetBusinessProfit())
                .homeLoanInterestSec24b(dto.getHomeLoanInterestSec24b())
                .deductions80C(dto.getDeductions80C())
                .deductions80D(dto.getDeductions80D())
                .build();

        repository.save(updated);

        return "Income and tax information updated successfully";
    }
    
    
    @Override
    public IncomeTaxInfoDto getIncomeTaxInfo(String tdsRefundId) {
        IncomeTaxInfo e = repository.findByRefundBankAccount_Id(tdsRefundId)
                .orElseThrow(() -> new ResourceNotFoundException("Income info not found"));

        return IncomeTaxInfoDto.builder()
                .id(e.getId())
                .tdsRefundId(e.getRefundBankAccount() != null ? e.getRefundBankAccount().getId() : null)
                .salaryIncome(e.getSalaryIncome())
                .otherIncome(e.getOtherIncome())
                .interestIncome(e.getInterestIncome())
                .rentalIncome(e.getRentalIncome())
                .municipalTaxesPaid(e.getMunicipalTaxesPaid())
                .shortTermCapitalGains(e.getShortTermCapitalGains())
                .longTermCapitalGains(e.getLongTermCapitalGains())
                .grossTurnover(e.getGrossTurnover())
                .netBusinessProfit(e.getNetBusinessProfit())
                .homeLoanInterestSec24b(e.getHomeLoanInterestSec24b())
                .deductions80C(e.getDeductions80C())
                .deductions80D(e.getDeductions80D())
                .build();
    }
}