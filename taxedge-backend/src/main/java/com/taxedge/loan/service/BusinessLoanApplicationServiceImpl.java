package com.taxedge.loan.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxedge.customer.entity.Customer;
import com.taxedge.customer.repository.CustomerRepository;
import com.taxedge.gst.exception.ResourceNotFoundException;
import com.taxedge.loan.dto.BusinessLoanApplicationDto;
import com.taxedge.loan.entity.BusinessLoanApplication;
import com.taxedge.loan.mapper.BusinessLoanApplicationMapper;
import com.taxedge.loan.repository.BusinessLoanApplicationRepository;
import com.taxedge.loan.service.BusinessLoanApplicationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BusinessLoanApplicationServiceImpl implements BusinessLoanApplicationService {

    private final BusinessLoanApplicationRepository repository;
    private final CustomerRepository customerRepository;
    private final BusinessLoanApplicationMapper mapper;

    @Override
    @Transactional
    public String saveApplication(BusinessLoanApplicationDto dto) {

        Customer customer = customerRepository.findById(dto.getCustId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Customer not found: " + dto.getCustId()));

        BusinessLoanApplication entity = mapper.toEntity(dto);
        entity.setCustomer(customer);

        String id = repository.save(entity).getId();
        log.info("Business loan application created: {} for customer {}",
                id, dto.getCustId());

        return id;
    }

    @Override
    @Transactional
    public String updateApplication(String id, BusinessLoanApplicationDto dto) {

        BusinessLoanApplication entity = findOrThrow(id);

        mapper.updateFromDto(dto, entity);

        log.info("Business loan application updated: {}", id);
        return id;
    }

    @Override
    public BusinessLoanApplicationDto getApplication(String id) {
        return mapper.toDto(findOrThrow(id));
    }

    private BusinessLoanApplication findOrThrow(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Loan application not found: " + id));
    }
}