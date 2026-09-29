package com.taxedge.loan.service;

import java.io.IOException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.taxedge.gst.exception.ResourceNotFoundException;
import com.taxedge.loan.dto.PersonalLoanDocumentDto;
import com.taxedge.loan.entity.PersonalLoanApplication;
import com.taxedge.loan.entity.PersonalLoanDocument;
import com.taxedge.loan.mapper.PersonalLoanDocumentMapper;
import com.taxedge.loan.repository.PersonalLoanApplicationRepository;
import com.taxedge.loan.repository.PersonalLoanDocumentRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PersonalLoanDocumentServiceImpl implements PersonalLoanDocumentService {

    private final PersonalLoanDocumentRepository repository;
    private final PersonalLoanApplicationRepository applicationRepository;
    private final PersonalLoanDocumentMapper mapper;

    @Override
    @Transactional
    public String saveDocuments(String loanApplicationId,
                                MultipartFile panCardFile,
                                MultipartFile aadhaarCardFile,
                                MultipartFile addressProofFile,
                                MultipartFile photographFile,
                                MultipartFile bankStatementsFile,
                                MultipartFile salarySlipsFile) {
        try {
            PersonalLoanApplication application = applicationRepository.findById(loanApplicationId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Loan application not found: " + loanApplicationId));

            PersonalLoanDocument entity = PersonalLoanDocument.builder()
                    .loanApplication(application)
                    .panCardFile(toBytes(panCardFile))
                    .aadhaarCardFile(toBytes(aadhaarCardFile))
                    .addressProofFile(toBytes(addressProofFile))
                    .photographFile(toBytes(photographFile))
                    .bankStatementsFile(toBytes(bankStatementsFile))
                    .salarySlipsFile(toBytes(salarySlipsFile))
                    .build();

            repository.save(entity);
            log.info("Documents saved for personal loan application {}", loanApplicationId);
            return loanApplicationId;

        } catch (IOException e) {
            throw new RuntimeException("Failed to read uploaded files: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public String updateDocuments(String loanApplicationId,
                                  MultipartFile panCardFile,
                                  MultipartFile aadhaarCardFile,
                                  MultipartFile addressProofFile,
                                  MultipartFile photographFile,
                                  MultipartFile bankStatementsFile,
                                  MultipartFile salarySlipsFile) {
        try {
            PersonalLoanDocument entity = findOrThrow(loanApplicationId);

            if (panCardFile != null && !panCardFile.isEmpty())
                entity.setPanCardFile(panCardFile.getBytes());
            if (aadhaarCardFile != null && !aadhaarCardFile.isEmpty())
                entity.setAadhaarCardFile(aadhaarCardFile.getBytes());
            if (addressProofFile != null && !addressProofFile.isEmpty())
                entity.setAddressProofFile(addressProofFile.getBytes());
            if (photographFile != null && !photographFile.isEmpty())
                entity.setPhotographFile(photographFile.getBytes());
            if (bankStatementsFile != null && !bankStatementsFile.isEmpty())
                entity.setBankStatementsFile(bankStatementsFile.getBytes());
            if (salarySlipsFile != null && !salarySlipsFile.isEmpty())
                entity.setSalarySlipsFile(salarySlipsFile.getBytes());

            log.info("Documents updated for personal loan application {}", loanApplicationId);
            return loanApplicationId;

        } catch (IOException e) {
            throw new RuntimeException("Failed to read uploaded files: " + e.getMessage(), e);
        }
    }

    @Override
    public PersonalLoanDocumentDto getDocuments(String loanApplicationId) {
        return mapper.toDto(findOrThrow(loanApplicationId));
    }

    @Override
    public byte[] downloadFile(String loanApplicationId, String fileType) {
        PersonalLoanDocument entity = findOrThrow(loanApplicationId);
        return switch (fileType.toLowerCase()) {
            case "pancardfile"        -> entity.getPanCardFile();
            case "aadhaarcard"        -> entity.getAadhaarCardFile();
            case "addressproof"       -> entity.getAddressProofFile();
            case "photograph"         -> entity.getPhotographFile();
            case "bankstatements"     -> entity.getBankStatementsFile();
            case "salaryslips"        -> entity.getSalarySlipsFile();
            default -> throw new ResourceNotFoundException("Unknown file type: " + fileType);
        };
    }

    private PersonalLoanDocument findOrThrow(String loanApplicationId) {
        return repository.findByLoanApplication_Id(loanApplicationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Documents not found for personal loan application: " + loanApplicationId));
    }

    private byte[] toBytes(MultipartFile file) throws IOException {
        return (file != null && !file.isEmpty()) ? file.getBytes() : null;
    }
}

