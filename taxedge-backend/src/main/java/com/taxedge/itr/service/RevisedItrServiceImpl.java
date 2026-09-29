package com.taxedge.itr.service;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import com.taxedge.customer.entity.Customer;
import com.taxedge.customer.repository.CustomerRepository;
import com.taxedge.itr.Exception.ResourceNotFoundException;
import com.taxedge.itr.dto.RevisedItrDto;
import com.taxedge.itr.entity.RevisedItr;
import com.taxedge.itr.helper.RandomNumberGenerator;
import com.taxedge.itr.repository.RevisedItrRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class RevisedItrServiceImpl implements RevisedItrService {

	
	private final RevisedItrRepository revisedItrRepository;

	
	private final  CustomerRepository customerRepository;

	@Autowired
	@Qualifier("itrModelMapper")
	private ModelMapper modelMapper;

	@Override
	public String createRevisedItr(RevisedItrDto dto) {

		Customer customer = customerRepository.findById(dto.getCustomerId())
				.orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + dto.getCustomerId()));

		RevisedItr revisedItr = modelMapper.map(dto, RevisedItr.class);

		revisedItr.setCustomer(customer);

		String revisedItrId = RandomNumberGenerator.generateRevisedItrId();

		revisedItr.setRevisedItrId(revisedItrId);

		revisedItrRepository.save(revisedItr);

		return "Revised ITR details registered successfully. Revised ITR ID: " + revisedItrId;
	}

	@Override
	public RevisedItrDto getRevisedItr(String revisedItrId) {

		RevisedItr revisedItr = revisedItrRepository.findById(revisedItrId)
				.orElseThrow(() -> new ResourceNotFoundException("Revised ITR not found with ID: " + revisedItrId));

		RevisedItrDto dto = modelMapper.map(revisedItr, RevisedItrDto.class);

		dto.setCustomerId(revisedItr.getCustomer().getCustId());

		return dto;
	}

	@Override
	public String updateRevisedItr(String revisedItrId, RevisedItrDto dto) {

		RevisedItr revisedItr = revisedItrRepository.findById(revisedItrId)
				.orElseThrow(() -> new ResourceNotFoundException("Revised ITR not found with ID: " + revisedItrId));

		modelMapper.map(dto, revisedItr);

		if (dto.getCustomerId() != null && !dto.getCustomerId().isBlank()) {

			Customer customer = customerRepository.findById(dto.getCustomerId()).orElseThrow(
					() -> new ResourceNotFoundException("Customer not found with ID: " + dto.getCustomerId()));

			revisedItr.setCustomer(customer);
		}

		revisedItr.setRevisedItrId(revisedItrId);

		revisedItrRepository.save(revisedItr);

		return "Revised ITR details updated successfully";
	}
}