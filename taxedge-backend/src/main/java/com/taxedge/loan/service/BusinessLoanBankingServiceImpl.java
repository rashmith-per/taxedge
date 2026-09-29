package com.taxedge.loan.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxedge.gst.exception.ResourceNotFoundException;
import com.taxedge.loan.dto.BusinessLoanBankingDto;
import com.taxedge.loan.entity.BusinessLoanApplication;
import com.taxedge.loan.entity.BusinessLoanBanking;
import com.taxedge.loan.mapper.BusinessLoanBankingMapper;
import com.taxedge.loan.repository.BusinessLoanApplicationRepository;
import com.taxedge.loan.repository.BusinessLoanBankingRepository;
import com.taxedge.loan.service.BusinessLoanBankingService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BusinessLoanBankingServiceImpl implements BusinessLoanBankingService {

    private final BusinessLoanBankingRepository repository;
    private final BusinessLoanApplicationRepository applicationRepository;
    private final BusinessLoanBankingMapper mapper;

    @Override
    @Transactional
    public String saveBanking(BusinessLoanBankingDto dto) {

        BusinessLoanApplication application = applicationRepository
                .findById(dto.getLoanApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Loan application not found: " + dto.getLoanApplicationId()));

        BusinessLoanBanking entity = mapper.toEntity(dto);
        entity.setLoanApplication(application);

        repository.save(entity);
        log.info("Banking details saved for application {}", application.getId());

        return application.getId();
    }

    @Override
    @Transactional
    public String updateBanking(String loanApplicationId, BusinessLoanBankingDto dto) {

        BusinessLoanBanking entity = findOrThrow(loanApplicationId);

        mapper.updateFromDto(dto, entity);

        log.info("Banking details updated for application {}", loanApplicationId);
        return loanApplicationId;
    }

    @Override
    public BusinessLoanBankingDto getBanking(String loanApplicationId) {
        return mapper.toDto(findOrThrow(loanApplicationId));
    }

    private BusinessLoanBanking findOrThrow(String loanApplicationId) {
        return repository.findByLoanApplication_Id(loanApplicationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Banking details not found for application: " + loanApplicationId));
    }
}