package com.taxedge.itr.service;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import com.taxedge.itr.Exception.ResourceNotFoundException;
import com.taxedge.itr.dto.RevisionReasonDto;
import com.taxedge.itr.entity.RevisedItr;
import com.taxedge.itr.entity.RevisionReasonEntity;
import com.taxedge.itr.helper.RandomNumberGenerator;
import com.taxedge.itr.repository.RevisedItrRepository;
import com.taxedge.itr.repository.RevisionReasonRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class RevisionReasonServiceImpl implements RevisionReasonService {

	
	private final RevisionReasonRepository revisionReasonRepository;

	
	private final  RevisedItrRepository revisedItrRepository;

	@Autowired
	@Qualifier("itrModelMapper")
	private ModelMapper modelMapper;

	@Override
	public String createRevisionReason(RevisionReasonDto dto) {

		if (dto.getReason() == null) {
			throw new IllegalArgumentException("Reason is required");
		}

		if (dto.getReason().name().equals("OTHER")
				&& (dto.getOtherReason() == null || dto.getOtherReason().trim().isEmpty())) {

			throw new IllegalArgumentException("Other reason is required when reason is OTHER");
		}

		RevisedItr revisedItr = revisedItrRepository.findById(dto.getRevisedItrId())
				.orElseThrow(() -> new ResourceNotFoundException(
						"Revised ITR not found with revisedItrId: " + dto.getRevisedItrId()));

		RevisionReasonEntity revisionReason = modelMapper.map(dto, RevisionReasonEntity.class);

		revisionReason.setRevisedItr(revisedItr);

		String revisionReasonId = RandomNumberGenerator.generateRevisionReasonId();

		revisionReason.setRevisionReasonId(revisionReasonId);

		revisionReasonRepository.save(revisionReason);

		return "Revision reason registered successfully. Revision Reason ID: " + revisionReasonId;
	}

	@Override
	public String updateRevisionReason(String revisionReasonId, RevisionReasonDto dto) {

		RevisionReasonEntity revisionReason = revisionReasonRepository.findById(revisionReasonId)
				.orElseThrow(() -> new ResourceNotFoundException(
						"Revision reason not found with revisionReasonId: " + revisionReasonId));

		if (dto.getReason() == null) {
			throw new IllegalArgumentException("Reason is required");
		}

		if (dto.getReason().name().equals("OTHER")
				&& (dto.getOtherReason() == null || dto.getOtherReason().trim().isEmpty())) {

			throw new IllegalArgumentException("Other reason is required when reason is OTHER");
		}

		modelMapper.map(dto, revisionReason);

		if (dto.getRevisedItrId() != null && !dto.getRevisedItrId().isBlank()) {

			RevisedItr revisedItr = revisedItrRepository.findById(dto.getRevisedItrId())
					.orElseThrow(() -> new ResourceNotFoundException(
							"Revised ITR not found with revisedItrId: " + dto.getRevisedItrId()));

			revisionReason.setRevisedItr(revisedItr);
		}

		revisionReason.setRevisionReasonId(revisionReasonId);

		revisionReasonRepository.save(revisionReason);

		return "Revision reason updated successfully";
	}

	@Override
	public RevisionReasonDto getRevisionReason(String revisionReasonId) {

		RevisionReasonEntity revisionReason = revisionReasonRepository.findById(revisionReasonId)
				.orElseThrow(() -> new ResourceNotFoundException(
						"Revision reason not found with revisionReasonId: " + revisionReasonId));

		RevisionReasonDto dto = modelMapper.map(revisionReason, RevisionReasonDto.class);

		dto.setRevisedItrId(revisionReason.getRevisedItr().getRevisedItrId());

		return dto;
	}
}