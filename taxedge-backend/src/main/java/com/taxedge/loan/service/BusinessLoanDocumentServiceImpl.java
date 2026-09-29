package com.taxedge.loan.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxedge.gst.exception.ResourceNotFoundException;
import com.taxedge.loan.dto.BusinessLoanDocumentDto;
import com.taxedge.loan.entity.BusinessLoanApplication;
import com.taxedge.loan.entity.BusinessLoanDocument;
import com.taxedge.loan.mapper.BusinessLoanDocumentMapper;
import com.taxedge.loan.repository.BusinessLoanApplicationRepository;
import com.taxedge.loan.repository.BusinessLoanDocumentRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BusinessLoanDocumentServiceImpl implements BusinessLoanDocumentService {

    private final BusinessLoanDocumentRepository repository;
    private final BusinessLoanApplicationRepository applicationRepository;
    private final BusinessLoanDocumentMapper mapper;

    @Override
    @Transactional
    public String saveDocuments(BusinessLoanDocumentDto dto) {

        BusinessLoanApplication application = applicationRepository
                .findById(dto.getLoanApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Loan application not found: " + dto.getLoanApplicationId()));

        BusinessLoanDocument entity = mapper.toEntity(dto);
        entity.setLoanApplication(application);

        repository.save(entity);
        log.info("Documents saved for application {}", application.getId());

        return application.getId();
    }

    @Override
    @Transactional
    public String updateDocuments(String loanApplicationId, BusinessLoanDocumentDto dto) {

        BusinessLoanDocument entity = findOrThrow(loanApplicationId);

        mapper.updateFromDto(dto, entity);

        log.info("Documents updated for application {}", loanApplicationId);
        return loanApplicationId;
    }

    @Override
    public BusinessLoanDocumentDto getDocuments(String loanApplicationId) {
        return mapper.toDto(findOrThrow(loanApplicationId));
    }

    private BusinessLoanDocument findOrThrow(String loanApplicationId) {
        return repository.findByLoanApplication_Id(loanApplicationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Documents not found for application: " + loanApplicationId));
    }
}
