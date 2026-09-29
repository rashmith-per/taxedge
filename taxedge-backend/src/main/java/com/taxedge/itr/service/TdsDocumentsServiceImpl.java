package com.taxedge.itr.service;

import java.util.Optional;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxedge.itr.Exception.ResourceNotFoundException;
import com.taxedge.itr.dto.TdsDocumentsDto;
import com.taxedge.itr.entity.RefundBankAccount;
import com.taxedge.itr.entity.TdsDocuments;
import com.taxedge.itr.repository.RefundBankAccountRepository;
import com.taxedge.itr.repository.TdsDocumentsRepository;

@Service
@RequiredArgsConstructor
public class TdsDocumentsServiceImpl implements TdsDocumentsService {

    private final TdsDocumentsRepository repository;
    private final RefundBankAccountRepository bankAccountRepository;

    @Override
    @Transactional
    public String saveDocuments(TdsDocumentsDto dto) {

        com.taxedge.itr.entity.RefundBankAccount bankAccount = null;
        TdsDocuments existing = null;

        String refId = (dto.getTdsRefundId() != null && !dto.getTdsRefundId().trim().isEmpty())
                ? dto.getTdsRefundId().trim()
                : null;

        if (refId != null) {
            bankAccount = bankAccountRepository.findById(refId).orElse(null);
            if (bankAccount == null) {
                bankAccount = bankAccountRepository.findTopByCustIdOrderByCreatedAtDesc(refId).orElse(null);
            }
            if (bankAccount == null) {
                String cleanMob = refId.replaceAll("\\D", "");
                if (!cleanMob.isEmpty()) {
                    bankAccount = bankAccountRepository.findTopByCustIdOrderByCreatedAtDesc(cleanMob).orElse(null);
                }
            }
        }

        if (bankAccount == null) {
            if (refId == null || refId.isEmpty()) {
                refId = "TDSR-" + System.currentTimeMillis();
            }
            bankAccount = com.taxedge.itr.entity.RefundBankAccount.builder()
                    .id(refId)
                    .custId(refId)
                    .accountHolderName("TDS Applicant")
                    .accountNumber("N/A")
                    .ifscCode("N/A")
                    .accountType(com.taxedge.gst.enums.AccountType.SAVINGS)
                    .createdAt(java.time.LocalDateTime.now())
                    .build();
            bankAccount = bankAccountRepository.save(bankAccount);
        }

        if (existing == null && bankAccount != null) {
            existing = repository.findByRefundBankAccount_Id(bankAccount.getId()).orElse(null);
        }

        TdsDocuments entity = TdsDocuments.builder()
                .id(existing != null ? existing.getId() : (dto.getId() != null ? dto.getId() : null))
                .createdAt(existing != null ? existing.getCreatedAt() : null)
                .refundBankAccount(bankAccount)
                .panFile(keep(dto.getPanFile(), existing != null ? existing.getPanFile() : null))
                .form16File(keep(dto.getForm16File(), existing != null ? existing.getForm16File() : null))
                .form16aFile(keep(dto.getForm16aFile(), existing != null ? existing.getForm16aFile() : null))
                .aisFile(keep(dto.getAisFile(), existing != null ? existing.getAisFile() : null))
                .tisFile(keep(dto.getTisFile(), existing != null ? existing.getTisFile() : null))
                .bankStatementsFile(keep(dto.getBankStatementsFile(), existing != null ? existing.getBankStatementsFile() : null))
                .prevItrFile(keep(dto.getPrevItrFile(), existing != null ? existing.getPrevItrFile() : null))
                .tdsCertsFile(keep(dto.getTdsCertsFile(), existing != null ? existing.getTdsCertsFile() : null))
                .incomeProofsFile(keep(dto.getIncomeProofsFile(), existing != null ? existing.getIncomeProofsFile() : null))
                .build();

        TdsDocuments saved = repository.save(entity);

        return "Documents saved successfully. ID: " + saved.getId();
    }

    @Override
    @Transactional
    public String updateDocuments(Long id, TdsDocumentsDto dto) {

        TdsDocuments existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Documents not found"));

        com.taxedge.itr.entity.RefundBankAccount bankAccount = existing.getRefundBankAccount();
        if (dto.getTdsRefundId() != null && !dto.getTdsRefundId().trim().isEmpty()) {
            String refId = dto.getTdsRefundId().trim();
            com.taxedge.itr.entity.RefundBankAccount found = bankAccountRepository.findById(refId).orElse(null);
            if (found == null) {
                found = bankAccountRepository.findTopByCustIdOrderByCreatedAtDesc(refId).orElse(null);
            }
            if (found != null) {
                bankAccount = found;
            }
        }

        TdsDocuments updated = TdsDocuments.builder()
                .id(existing.getId())                   // same id -> UPDATE
                .createdAt(existing.getCreatedAt())     // keep original timestamp
                .refundBankAccount(bankAccount)
                .panFile(keep(dto.getPanFile(), existing.getPanFile()))
                .form16File(keep(dto.getForm16File(), existing.getForm16File()))
                .form16aFile(keep(dto.getForm16aFile(), existing.getForm16aFile()))
                .aisFile(keep(dto.getAisFile(), existing.getAisFile()))
                .tisFile(keep(dto.getTisFile(), existing.getTisFile()))
                .bankStatementsFile(keep(dto.getBankStatementsFile(), existing.getBankStatementsFile()))
                .prevItrFile(keep(dto.getPrevItrFile(), existing.getPrevItrFile()))
                .tdsCertsFile(keep(dto.getTdsCertsFile(), existing.getTdsCertsFile()))
                .incomeProofsFile(keep(dto.getIncomeProofsFile(), existing.getIncomeProofsFile()))
                .build();

        repository.save(updated);

        return "Documents updated successfully";
    }

    /** Use the new file if a non-empty byte array was sent, otherwise keep the stored one. */
    private byte[] keep(byte[] newFile, byte[] existingFile) {
        if (newFile != null && newFile.length > 0) {
            return newFile;
        }
        return existingFile;
    }
    
    
    @Override
    public TdsDocumentsDto getDocuments(String tdsRefundId) {
        TdsDocuments e = repository.findByRefundBankAccount_Id(tdsRefundId).orElse(null);
        if (e == null && tdsRefundId != null) {
            String clean = tdsRefundId.replaceAll("\\D", "");
            if (!clean.isEmpty()) {
                com.taxedge.itr.entity.RefundBankAccount bank = bankAccountRepository.findTopByCustIdOrderByCreatedAtDesc(clean).orElse(null);
                if (bank != null) {
                    e = repository.findByRefundBankAccount_Id(bank.getId()).orElse(null);
                }
            }
        }
        if (e == null) {
            throw new ResourceNotFoundException("Documents not found for ID: " + tdsRefundId);
        }

        return TdsDocumentsDto.builder()
                .id(e.getId())
                .tdsRefundId(e.getRefundBankAccount() != null ? e.getRefundBankAccount().getId() : tdsRefundId)
                .panFile(e.getPanFile())
                .form16File(e.getForm16File())
                .form16aFile(e.getForm16aFile())
                .aisFile(e.getAisFile())
                .tisFile(e.getTisFile())
                .bankStatementsFile(e.getBankStatementsFile())
                .prevItrFile(e.getPrevItrFile())
                .tdsCertsFile(e.getTdsCertsFile())
                .incomeProofsFile(e.getIncomeProofsFile())
                .build();
    }
}