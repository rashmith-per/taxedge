package com.taxedge.itr.controller;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taxedge.itr.dto.TaxNoticeAssistanceDto;
import com.taxedge.itr.dto.TaxNoticeDocumentDto;
import com.taxedge.itr.service.TaxNoticeAssistanceService;
import com.taxedge.itr.service.TaxNoticeDocumentService;

@RestController
@RequestMapping("/api/v1/itr/tax-notice")
public class TaxNoticeAssistanceController {

	@Autowired
	private TaxNoticeAssistanceService taxNoticeAssistanceService;

	@Autowired
	private TaxNoticeDocumentService taxNoticeDocumentService;

	@Autowired
	private ObjectMapper objectMapper;

	@PostMapping("/register")
	public ResponseEntity<String> createTaxNotice(@RequestPart("data") String data,
			@RequestPart("file") MultipartFile file) throws IOException {

		TaxNoticeAssistanceDto dto = objectMapper.readValue(data, TaxNoticeAssistanceDto.class);

		String result = taxNoticeAssistanceService.createTaxNotice(dto, file);

		return new ResponseEntity<>(result, HttpStatus.CREATED);
	}

	@GetMapping("/{noticeId}")
	public ResponseEntity<TaxNoticeAssistanceDto> getTaxNotice(@PathVariable String noticeId) {

		TaxNoticeAssistanceDto taxNotice = taxNoticeAssistanceService.getTaxNotice(noticeId);

		return ResponseEntity.ok(taxNotice);
	}

	@PutMapping("/update/{noticeId}")
	public ResponseEntity<String> updateTaxNotice(@PathVariable String noticeId, @RequestPart("data") String data,
			@RequestPart("file") MultipartFile file) throws IOException {

		TaxNoticeAssistanceDto dto = objectMapper.readValue(data, TaxNoticeAssistanceDto.class);

		String result = taxNoticeAssistanceService.updateTaxNotice(noticeId, dto, file);

		return ResponseEntity.ok(result);
	}

	@PostMapping("/{noticeId}/document/register")
	public ResponseEntity<String> registerDocuments(@PathVariable String noticeId,
			@RequestPart(value = "data", required = false) String data,
			@RequestPart(value = "taxNotice", required = false) MultipartFile taxNotice,
			@RequestPart(value = "previousItr", required = false) MultipartFile previousItr,
			@RequestPart(value = "itrAcknowledgement", required = false) MultipartFile itrAcknowledgement,
			@RequestPart(value = "form1616a", required = false) MultipartFile form1616a,
			@RequestPart(value = "aisAy", required = false) MultipartFile aisAy,
			@RequestPart(value = "tis", required = false) MultipartFile tis,
			@RequestPart(value = "bankStatement", required = false) MultipartFile bankStatement,
			@RequestPart(value = "supportingIncomeDocuments", required = false) MultipartFile supportingIncomeDocuments,
			@RequestPart(value = "supportingExpenseDocuments", required = false) MultipartFile supportingExpenseDocuments,
			@RequestPart(value = "previousTaxResponses", required = false) MultipartFile previousTaxResponses,
			@RequestPart(value = "otherNoticeSpecificDocuments", required = false) MultipartFile otherNoticeSpecificDocuments)
			throws IOException {

		String result = taxNoticeDocumentService.registerDocuments(noticeId, data, taxNotice, previousItr,
				itrAcknowledgement, form1616a, aisAy, tis, bankStatement, supportingIncomeDocuments,
				supportingExpenseDocuments, previousTaxResponses, otherNoticeSpecificDocuments);

		return new ResponseEntity<>(result, HttpStatus.CREATED);
	}

	@GetMapping("/{documentId}/documents")
	public ResponseEntity<TaxNoticeDocumentDto> getDocuments(@PathVariable String documentId) {

		TaxNoticeDocumentDto documents = taxNoticeDocumentService.getDocuments(documentId);

		return ResponseEntity.ok(documents);
	}

	@PutMapping("/{documentId}/documents/update")
	public ResponseEntity<String> updateDocuments(@PathVariable String documentId,
			
			@RequestPart(value = "data", required = false) String data,
			@RequestPart(value = "taxNotice", required = false) MultipartFile taxNotice,
			@RequestPart(value = "previousItr", required = false) MultipartFile previousItr,
			@RequestPart(value = "itrAcknowledgement", required = false) MultipartFile itrAcknowledgement,
			@RequestPart(value = "form1616a", required = false) MultipartFile form1616a,
			@RequestPart(value = "aisAy", required = false) MultipartFile aisAy,
			@RequestPart(value = "tis", required = false) MultipartFile tis,
			@RequestPart(value = "bankStatement", required = false) MultipartFile bankStatement,
			@RequestPart(value = "supportingIncomeDocuments", required = false) MultipartFile supportingIncomeDocuments,
			@RequestPart(value = "supportingExpenseDocuments", required = false) MultipartFile supportingExpenseDocuments,
			@RequestPart(value = "previousTaxResponses", required = false) MultipartFile previousTaxResponses,
			@RequestPart(value = "otherNoticeSpecificDocuments", required = false) MultipartFile otherNoticeSpecificDocuments)
			throws IOException {

		String result = taxNoticeDocumentService.updateDocuments(documentId, data, taxNotice, previousItr,
				itrAcknowledgement, form1616a, aisAy, tis, bankStatement, supportingIncomeDocuments,
				supportingExpenseDocuments, previousTaxResponses, otherNoticeSpecificDocuments);

		return ResponseEntity.ok(result);
	}
}