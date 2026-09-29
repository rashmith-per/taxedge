package com.taxedge.itr.service;

import java.io.IOException;
import java.util.Base64;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.taxedge.itr.Exception.ResourceNotFoundException;
import com.taxedge.itr.dto.RevisedItrDocumentDto;
import com.taxedge.itr.entity.RevisedItr;
import com.taxedge.itr.entity.RevisedItrDocument;
import com.taxedge.itr.helper.RandomNumberGenerator;
import com.taxedge.itr.repository.RevisedItrDocumentRepository;
import com.taxedge.itr.repository.RevisedItrRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class RevisedItrDocumentServiceImpl implements RevisedItrDocumentService {

	
	private final  RevisedItrDocumentRepository revisedItrDocumentRepository;

	
	private final RevisedItrRepository revisedItrRepository;

	@Autowired
	@Qualifier("itrModelMapper")
	private ModelMapper modelMapper;

	@Override
	public String registerDocuments(String revisedItrId, MultipartFile panCard, MultipartFile aadhaarCard,
			MultipartFile form16Form16A, MultipartFile aisTisStatement, MultipartFile bankStatements,
			MultipartFile investmentProofs) throws IOException {

		RevisedItr revisedItr = revisedItrRepository.findById(revisedItrId).orElseThrow(
				() -> new ResourceNotFoundException("Revised ITR not found with revisedItrId: " + revisedItrId));

		if (panCard == null && aadhaarCard == null && form16Form16A == null && aisTisStatement == null
				&& bankStatements == null && investmentProofs == null) {

			throw new IllegalArgumentException("Please select at least one document");
		}

		if (!revisedItrDocumentRepository.findByRevisedItrRevisedItrId(revisedItrId).isEmpty()) {

			throw new IllegalArgumentException("Documents already exist for this Revised ITR");
		}

		RevisedItrDocument document = new RevisedItrDocument();

		String documentId = RandomNumberGenerator.generateRevisedItrDocumentId();

		document.setDocumentId(documentId);

		document.setRevisedItr(revisedItr);

		if (panCard != null && !panCard.isEmpty()) {
			document.setPanCard(convertFile(panCard));
		}

		if (aadhaarCard != null && !aadhaarCard.isEmpty()) {
			document.setAadhaarCard(convertFile(aadhaarCard));
		}

		if (form16Form16A != null && !form16Form16A.isEmpty()) {
			document.setForm16Form16A(convertFile(form16Form16A));
		}

		if (aisTisStatement != null && !aisTisStatement.isEmpty()) {
			document.setAisTisStatement(convertFile(aisTisStatement));
		}

		if (bankStatements != null && !bankStatements.isEmpty()) {
			document.setBankStatements(convertFile(bankStatements));
		}

		if (investmentProofs != null && !investmentProofs.isEmpty()) {
			document.setInvestmentProofs(convertFile(investmentProofs));
		}

		revisedItrDocumentRepository.save(document);

		return "Revised ITR documents uploaded successfully. Document ID: " + documentId;
	}

	@Override
	public String updateDocuments(String documentId, MultipartFile panCard, MultipartFile aadhaarCard,
			MultipartFile form16Form16A, MultipartFile aisTisStatement, MultipartFile bankStatements,
			MultipartFile investmentProofs) throws IOException {

		RevisedItrDocument document = revisedItrDocumentRepository.findById(documentId).orElseThrow(
				() -> new ResourceNotFoundException("Revised ITR documents not found with documentId: " + documentId));

		if (panCard == null && aadhaarCard == null && form16Form16A == null && aisTisStatement == null
				&& bankStatements == null && investmentProofs == null) {

			throw new IllegalArgumentException("Please select at least one document");
		}

		if (panCard != null && !panCard.isEmpty()) {
			document.setPanCard(convertFile(panCard));
		}

		if (aadhaarCard != null && !aadhaarCard.isEmpty()) {
			document.setAadhaarCard(convertFile(aadhaarCard));
		}

		if (form16Form16A != null && !form16Form16A.isEmpty()) {
			document.setForm16Form16A(convertFile(form16Form16A));
		}

		if (aisTisStatement != null && !aisTisStatement.isEmpty()) {
			document.setAisTisStatement(convertFile(aisTisStatement));
		}

		if (bankStatements != null && !bankStatements.isEmpty()) {
			document.setBankStatements(convertFile(bankStatements));
		}

		if (investmentProofs != null && !investmentProofs.isEmpty()) {
			document.setInvestmentProofs(convertFile(investmentProofs));
		}

		revisedItrDocumentRepository.save(document);

		return "Revised ITR documents updated successfully";
	}

	@Override
	public RevisedItrDocumentDto getDocuments(String documentId) {

		RevisedItrDocument document = revisedItrDocumentRepository.findById(documentId).orElseThrow(
				() -> new ResourceNotFoundException("Revised ITR documents not found with documentId: " + documentId));

		RevisedItrDocumentDto dto = modelMapper.map(document, RevisedItrDocumentDto.class);

		dto.setRevisedItrId(document.getRevisedItr().getRevisedItrId());

		return dto;
	}

	@Override
	public String deleteDocuments(String documentId) {

		RevisedItrDocument document = revisedItrDocumentRepository.findById(documentId).orElseThrow(
				() -> new ResourceNotFoundException("Revised ITR documents not found with documentId: " + documentId));

		revisedItrDocumentRepository.delete(document);

		return "Revised ITR documents deleted successfully";
	}

	private String convertFile(MultipartFile file) throws IOException {

		if (file == null || file.isEmpty()) {
			throw new IllegalArgumentException("Document file is empty");
		}

		return Base64.getEncoder().encodeToString(file.getBytes());
	}
}