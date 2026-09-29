package com.taxedge.loan.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxedge.customer.entity.Customer;
import com.taxedge.customer.repository.CustomerRepository;
import com.taxedge.gst.exception.ResourceNotFoundException;
import com.taxedge.loan.dto.PersonalLoanApplicationDto;
import com.taxedge.loan.entity.PersonalLoanApplication;
import com.taxedge.loan.mapper.PersonalLoanApplicationMapper;
import com.taxedge.loan.repository.PersonalLoanApplicationRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PersonalLoanApplicationServiceImpl implements PersonalLoanApplicationService {

    private final PersonalLoanApplicationRepository repository;
    private final CustomerRepository customerRepository;
    private final PersonalLoanApplicationMapper mapper;

    @Override
    @Transactional
    public String saveApplication(PersonalLoanApplicationDto dto) {

        Customer customer = customerRepository.findById(dto.getCustId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Customer not found: " + dto.getCustId()));

        PersonalLoanApplication entity = mapper.toEntity(dto);
        entity.setCustomer(customer);

        String id = repository.save(entity).getId();
        log.info("Personal loan application created: {} for customer {}",
                id, dto.getCustId());

        return id;
    }

    @Override
    @Transactional
    public String updateApplication(String id, PersonalLoanApplicationDto dto) {

        PersonalLoanApplication entity = findOrThrow(id);

        mapper.updateFromDto(dto, entity);

        log.info("Personal loan application updated: {}", id);
        return id;
    }

    @Override
    public PersonalLoanApplicationDto getApplication(String id) {
        return mapper.toDto(findOrThrow(id));
    }

    private PersonalLoanApplication findOrThrow(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Personal loan application not found: " + id));
    }
}
