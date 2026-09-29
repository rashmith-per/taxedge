package com.taxedge.gst.service;

import com.taxedge.gst.dto.BankAccountAmendmentViewDto;
import com.taxedge.gst.entity.BankAccountAmendmentEntity;
import com.taxedge.gst.entity.Business;
import com.taxedge.gst.enums.AccountType;
import com.taxedge.gst.exception.ResourceNotFoundException;
import com.taxedge.gst.repository.BankAccountAmendmentRepository;
import com.taxedge.gst.repository.BusinessRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class BankAccountAmendmentServiceImpl implements BankAccountAmendmentService {

    private final BusinessRepository businessRepository;
    private final BankAccountAmendmentRepository bankAmendmentRepository;

    private Business resolveBusiness(String gstId) {
        return businessRepository.findById(gstId)
                .orElseGet(() -> businessRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("No registered business found in the system.")));
    }

    @Override
    public BankAccountAmendmentViewDto getExistingBankAccountDetails(String gstId) {
        Business business = resolveBusiness(gstId);

        return BankAccountAmendmentViewDto.builder()
                .newBankName(business.getBankName())
                .newBankAccountNumber(business.getBankAccountNumber())
                .newIfscCode(business.getIfscCode())
                .newAccountType(business.getAccountType())
                .build();
    }

    @Override
    @Transactional
    public String submitBankAccountAmendment(String gstId, String bankName, String accountNumber,
                                             String ifscCode, AccountType accountType, MultipartFile file) throws IOException {

        Business business = resolveBusiness(gstId);

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Supporting proof document is required for bank account amendment");
        }

        String base64Data = Base64.getEncoder().encodeToString(file.getBytes());

        BankAccountAmendmentEntity amendment = BankAccountAmendmentEntity.builder()
                .business(business)
                .newBankName(bankName)
                .newBankAccountNumber(accountNumber)
                .newIfscCode(ifscCode)
                .newAccountType(accountType)
                .imageData(base64Data)
                .build();

        bankAmendmentRepository.save(amendment);

        return "Bank account amendment submitted successfully and is pending agent review.";
    }
}
