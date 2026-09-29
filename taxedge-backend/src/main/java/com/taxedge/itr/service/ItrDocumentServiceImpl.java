package com.taxedge.itr.service;

import java.io.IOException;
import java.util.Base64;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.taxedge.itr.Exception.ResourceNotFoundException;
import com.taxedge.itr.dto.DocumentDto;
import com.taxedge.itr.entity.ItrDocument;
import com.taxedge.itr.entity.ItrFiling;
import com.taxedge.itr.helper.RandomNumberGenerator;
import com.taxedge.itr.repository.ItrDocumentRepository;
import com.taxedge.itr.repository.ItrFilingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ItrDocumentServiceImpl implements ItrDocumentService {

	
	private final ItrDocumentRepository documentRepository;

	
	private final ItrFilingRepository itrFilingRepository;

	@Autowired
	@Qualifier("itrModelMapper")
	private ModelMapper modelMapper;

	@Override
	public String registerDocuments(String itrId, MultipartFile form16PartAPartB, MultipartFile form26as,
			MultipartFile aisTis, MultipartFile bankAccountStatement, MultipartFile salaryPayslips) throws IOException {

		ItrFiling itrFiling = itrFilingRepository.findById(itrId)
				.orElseThrow(() -> new ResourceNotFoundException("ITR Filing not found with itrId: " + itrId));

		if (form16PartAPartB == null && form26as == null && aisTis == null && bankAccountStatement == null
				&& salaryPayslips == null) {

			throw new IllegalArgumentException("Please select at least one document");
		}

		ItrDocument document = new ItrDocument();

		String documentId = RandomNumberGenerator.generateDocumentId();

		document.setDocumentId(documentId);

		document.setItrFiling(itrFiling);

		if (form16PartAPartB != null && !form16PartAPartB.isEmpty()) {

			document.setForm16PartAPartB(convertFile(form16PartAPartB));
		}

		if (form26as != null && !form26as.isEmpty()) {

			document.setForm26as(convertFile(form26as));
		}

		if (aisTis != null && !aisTis.isEmpty()) {

			document.setAisTis(convertFile(aisTis));
		}

		if (bankAccountStatement != null && !bankAccountStatement.isEmpty()) {

			document.setBankAccountStatement(convertFile(bankAccountStatement));
		}

		if (salaryPayslips != null && !salaryPayslips.isEmpty()) {

			document.setSalaryPayslips(convertFile(salaryPayslips));
		}

		documentRepository.save(document);

		return "ITR documents uploaded successfully. Document ID: " + documentId;
	}

	@Override
	public DocumentDto getDocuments(String documentId) {

		ItrDocument document = documentRepository.findById(documentId).orElseThrow(
				() -> new ResourceNotFoundException("ITR documents not found with documentId: " + documentId));

		return modelMapper.map(document, DocumentDto.class);
	}

	@Override
	public String updateDocuments(String documentId, MultipartFile form16PartAPartB, MultipartFile form26as,
			MultipartFile aisTis, MultipartFile bankAccountStatement, MultipartFile salaryPayslips) throws IOException {

		ItrDocument document = documentRepository.findById(documentId).orElseThrow(
				() -> new ResourceNotFoundException("ITR documents not found with documentId: " + documentId));

		if (form16PartAPartB == null && form26as == null && aisTis == null && bankAccountStatement == null
				&& salaryPayslips == null) {

			throw new IllegalArgumentException("Please select at least one document");
		}

		if (form16PartAPartB != null && !form16PartAPartB.isEmpty()) {

			document.setForm16PartAPartB(convertFile(form16PartAPartB));
		}

		if (form26as != null && !form26as.isEmpty()) {

			document.setForm26as(convertFile(form26as));
		}

		if (aisTis != null && !aisTis.isEmpty()) {

			document.setAisTis(convertFile(aisTis));
		}

		if (bankAccountStatement != null && !bankAccountStatement.isEmpty()) {

			document.setBankAccountStatement(convertFile(bankAccountStatement));
		}

		if (salaryPayslips != null && !salaryPayslips.isEmpty()) {

			document.setSalaryPayslips(convertFile(salaryPayslips));
		}

		documentRepository.save(document);

		return "ITR documents updated successfully. Document ID: " + documentId;
	}

	@Override
	public String deleteDocuments(String documentId) {

		ItrDocument document = documentRepository.findById(documentId).orElseThrow(
				() -> new ResourceNotFoundException("ITR documents not found with documentId: " + documentId));

		documentRepository.delete(document);

		return "ITR documents deleted successfully";
	}

	private String convertFile(MultipartFile file) throws IOException {

		byte[] fileBytes = file.getBytes();

		return Base64.getEncoder().encodeToString(fileBytes);
	}
}