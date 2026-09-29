package com.taxedge.itr.service;

import java.time.LocalDateTime;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.taxedge.itr.Exception.ResourceNotFoundException;
import com.taxedge.itr.dto.RefundBankAccountDto;
import com.taxedge.itr.entity.RefundBankAccount;
import com.taxedge.itr.helper.RandomNumberGenerator;
import com.taxedge.itr.repository.RefundBankAccountRepository;

import jakarta.transaction.Transactional;

@Service
@RequiredArgsConstructor
public class RefundBankAccountServiceImpl implements RefundBankAccountService {

    private final RefundBankAccountRepository repository;

    

    @Override
    @Transactional
    public String saveBankAccount(RefundBankAccountDto dto) {

        String refundId = (dto.getId() != null && !dto.getId().trim().isEmpty())
                ? dto.getId().trim()
                : RandomNumberGenerator.generateTdsRefundId();

        RefundBankAccount account = RefundBankAccount.builder()
                .id(refundId)
                .custId(dto.getCustId())
                .accountHolderName(dto.getAccountHolderName() != null ? dto.getAccountHolderName().trim() : "")
                .accountNumber(dto.getAccountNumber())
                .ifscCode(dto.getIfscCode() != null ? dto.getIfscCode().trim().toUpperCase() : "")
                .bankName(dto.getBankName())
                .branchName(dto.getBranchName())
                .accountType(dto.getAccountType())
                .createdAt(LocalDateTime.now())
                .build();

        repository.save(account);

        return "Bank account saved successfully. ID: " + account.getId();
    }

    @Override
    @Transactional
    public String updateBankAccount(String id, RefundBankAccountDto dto) {

        RefundBankAccount existing = repository.findById(id)
                .orElseGet(() -> repository.findByIdAndCustId(id, dto.getCustId())
                        .orElseThrow(() -> new RuntimeException("Bank account not found")));

        RefundBankAccount updated = RefundBankAccount.builder()
                .id(existing.getId())                       // same id -> UPDATE, not INSERT
                .custId(dto.getCustId() != null ? dto.getCustId() : existing.getCustId())
                .createdAt(existing.getCreatedAt())         // keep original timestamp
                .accountHolderName(dto.getAccountHolderName())
                .accountNumber(dto.getAccountNumber())
                .ifscCode(dto.getIfscCode())
                .bankName(dto.getBankName())
                .branchName(dto.getBranchName())
                .accountType(dto.getAccountType())
                .build();

        repository.save(updated);

        return "Bank account updated successfully";
    }
    
    
    
    @Override
    public RefundBankAccountDto getBankAccount(String id) {
        RefundBankAccount e = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Refund not found"));

        return RefundBankAccountDto.builder()
                .id(e.getId())
                .custId(e.getCustId())
                .accountHolderName(e.getAccountHolderName())
                .accountNumber(e.getAccountNumber())
                .ifscCode(e.getIfscCode())
                .bankName(e.getBankName())
                .branchName(e.getBranchName())
                .accountType(e.getAccountType())
                .build();
    }

    @Override
    public RefundBankAccountDto getBankAccountByCustId(String custId) {
        RefundBankAccount e = repository.findTopByCustIdOrderByCreatedAtDesc(custId)
                .orElseThrow(() -> new ResourceNotFoundException("Refund bank account not found for customer: " + custId));

        return RefundBankAccountDto.builder()
                .id(e.getId())
                .custId(e.getCustId())
                .accountHolderName(e.getAccountHolderName())
                .accountNumber(e.getAccountNumber())
                .ifscCode(e.getIfscCode())
                .bankName(e.getBankName())
                .branchName(e.getBranchName())
                .accountType(e.getAccountType())
                .build();
    }
}