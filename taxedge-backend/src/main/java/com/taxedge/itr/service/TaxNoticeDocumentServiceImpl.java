package com.taxedge.itr.service;

import java.io.IOException;
import java.util.Base64;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taxedge.itr.Exception.ResourceNotFoundException;
import com.taxedge.itr.dto.TaxNoticeDocumentDto;
import com.taxedge.itr.entity.TaxNoticeAssistance;
import com.taxedge.itr.entity.TaxNoticeDocument;
import com.taxedge.itr.helper.RandomNumberGenerator;
import com.taxedge.itr.repository.TaxNoticeAssistanceRepository;
import com.taxedge.itr.repository.TaxNoticeDocumentRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class TaxNoticeDocumentServiceImpl implements TaxNoticeDocumentService {

	
	private final TaxNoticeDocumentRepository taxNoticeDocumentRepository;

	
	private final TaxNoticeAssistanceRepository taxNoticeAssistanceRepository;

	@Autowired
	@Qualifier("itrModelMapper")
	private ModelMapper modelMapper;

	@Autowired
	private ObjectMapper objectMapper;

	@Override
	public String registerDocuments(String noticeId, String data, MultipartFile taxNotice, MultipartFile previousItr,
			MultipartFile itrAcknowledgement, MultipartFile form1616a, MultipartFile aisAy, MultipartFile tis,
			MultipartFile bankStatement, MultipartFile supportingIncomeDocuments,
			MultipartFile supportingExpenseDocuments, MultipartFile previousTaxResponses,
			MultipartFile otherNoticeSpecificDocuments) throws IOException {

		TaxNoticeAssistance taxNoticeAssistance = taxNoticeAssistanceRepository.findById(noticeId)
				.orElseThrow(() -> new ResourceNotFoundException("Tax Notice not found with ID: " + noticeId));

		if (taxNoticeDocumentRepository.findByTaxNoticeAssistanceNoticeId(noticeId).isPresent()) {

			throw new IllegalArgumentException("Documents already registered for notice ID: " + noticeId);
		}

		TaxNoticeDocument document = new TaxNoticeDocument();

		document.setDocumentId(RandomNumberGenerator.generateTaxNoticeDocumentId());

		document.setTaxNoticeAssistance(taxNoticeAssistance);

		TaxNoticeDocumentDto dto = null;

		if (data != null && !data.isEmpty()) {
			dto = objectMapper.readValue(data, TaxNoticeDocumentDto.class);
		}

		if (dto != null && dto.getMessage() != null && !dto.getMessage().isEmpty()) {

			document.setMessage(dto.getMessage());
		}

		if (taxNotice != null && !taxNotice.isEmpty()) {
			document.setTaxNotice(convertFile(taxNotice));
		}

		if (previousItr != null && !previousItr.isEmpty()) {
			document.setPreviousItr(convertFile(previousItr));
		}

		if (itrAcknowledgement != null && !itrAcknowledgement.isEmpty()) {
			document.setItrAcknowledgement(convertFile(itrAcknowledgement));
		}

		if (form1616a != null && !form1616a.isEmpty()) {
			document.setForm1616a(convertFile(form1616a));
		}

		if (aisAy != null && !aisAy.isEmpty()) {
			document.setAisAy(convertFile(aisAy));
		}

		if (tis != null && !tis.isEmpty()) {
			document.setTis(convertFile(tis));
		}

		if (bankStatement != null && !bankStatement.isEmpty()) {
			document.setBankStatement(convertFile(bankStatement));
		}

		if (supportingIncomeDocuments != null && !supportingIncomeDocuments.isEmpty()) {

			document.setSupportingIncomeDocuments(convertFile(supportingIncomeDocuments));
		}

		if (supportingExpenseDocuments != null && !supportingExpenseDocuments.isEmpty()) {

			document.setSupportingExpenseDocuments(convertFile(supportingExpenseDocuments));
		}

		if (previousTaxResponses != null && !previousTaxResponses.isEmpty()) {

			document.setPreviousTaxResponses(convertFile(previousTaxResponses));
		}

		if (otherNoticeSpecificDocuments != null && !otherNoticeSpecificDocuments.isEmpty()) {

			document.setOtherNoticeSpecificDocuments(convertFile(otherNoticeSpecificDocuments));
		}

		taxNoticeDocumentRepository.save(document);

		return "Tax Notice documents uploaded successfully. Document ID: " + document.getDocumentId();
	}

	@Override
	public String updateDocuments(String documentId, String data, MultipartFile taxNotice, MultipartFile previousItr,
			MultipartFile itrAcknowledgement, MultipartFile form1616a, MultipartFile aisAy, MultipartFile tis,
			MultipartFile bankStatement, MultipartFile supportingIncomeDocuments,
			MultipartFile supportingExpenseDocuments, MultipartFile previousTaxResponses,
			MultipartFile otherNoticeSpecificDocuments) throws IOException {

		TaxNoticeDocument document = taxNoticeDocumentRepository.findById(documentId)
				.orElseThrow(() -> new ResourceNotFoundException("Documents not found with ID: " + documentId));

		TaxNoticeDocumentDto dto = null;

		if (data != null && !data.isEmpty()) {
			dto = objectMapper.readValue(data, TaxNoticeDocumentDto.class);
		}

		if (dto != null && dto.getMessage() != null && !dto.getMessage().isEmpty()) {

			document.setMessage(dto.getMessage());
		}

		if (taxNotice != null && !taxNotice.isEmpty()) {
			document.setTaxNotice(convertFile(taxNotice));
		}

		if (previousItr != null && !previousItr.isEmpty()) {
			document.setPreviousItr(convertFile(previousItr));
		}

		if (itrAcknowledgement != null && !itrAcknowledgement.isEmpty()) {
			document.setItrAcknowledgement(convertFile(itrAcknowledgement));
		}

		if (form1616a != null && !form1616a.isEmpty()) {
			document.setForm1616a(convertFile(form1616a));
		}

		if (aisAy != null && !aisAy.isEmpty()) {
			document.setAisAy(convertFile(aisAy));
		}

		if (tis != null && !tis.isEmpty()) {
			document.setTis(convertFile(tis));
		}

		if (bankStatement != null && !bankStatement.isEmpty()) {
			document.setBankStatement(convertFile(bankStatement));
		}

		if (supportingIncomeDocuments != null && !supportingIncomeDocuments.isEmpty()) {

			document.setSupportingIncomeDocuments(convertFile(supportingIncomeDocuments));
		}

		if (supportingExpenseDocuments != null && !supportingExpenseDocuments.isEmpty()) {

			document.setSupportingExpenseDocuments(convertFile(supportingExpenseDocuments));
		}

		if (previousTaxResponses != null && !previousTaxResponses.isEmpty()) {

			document.setPreviousTaxResponses(convertFile(previousTaxResponses));
		}

		if (otherNoticeSpecificDocuments != null && !otherNoticeSpecificDocuments.isEmpty()) {

			document.setOtherNoticeSpecificDocuments(convertFile(otherNoticeSpecificDocuments));
		}

		taxNoticeDocumentRepository.save(document);

		return "Tax Notice documents updated successfully. Document ID: " + document.getDocumentId();
	}

	@Override
	public TaxNoticeDocumentDto getDocuments(String documentId) {

		TaxNoticeDocument document = taxNoticeDocumentRepository.findById(documentId)
				.orElseThrow(() -> new ResourceNotFoundException("Documents not found with ID: " + documentId));

		return modelMapper.map(document, TaxNoticeDocumentDto.class);
	}

	private String convertFile(MultipartFile file) throws IOException {

		return Base64.getEncoder().encodeToString(file.getBytes());
	}
}