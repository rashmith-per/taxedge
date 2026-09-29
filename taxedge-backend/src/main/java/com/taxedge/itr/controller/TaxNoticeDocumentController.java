//package com.taxedge.itr.controller;
//
//import java.io.IOException;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.PutMapping;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestPart;
//import org.springframework.web.bind.annotation.RestController;
//import org.springframework.web.multipart.MultipartFile;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.taxedge.itr.dto.TaxNoticeDocumentDto;
//import com.taxedge.itr.service.TaxNoticeDocumentService;
//
//@RestController
//@RequestMapping("/api/v1/itr/tax-notice")
//public class TaxNoticeDocumentController {
//
//	@Autowired
//	private TaxNoticeDocumentService taxNoticeDocumentService;
//
//	@Autowired
//	private ObjectMapper objectMapper;
//
//	@PostMapping("/{noticeId}/document/register")
//	public ResponseEntity<String> registerDocuments(@PathVariable String noticeId,
//			@RequestPart(value = "data", required = false) String data,
//			@RequestPart(value = "taxNotice", required = false) MultipartFile taxNotice,
//			@RequestPart(value = "previousItr", required = false) MultipartFile previousItr,
//			@RequestPart(value = "itrAcknowledgement", required = false) MultipartFile itrAcknowledgement,
//			@RequestPart(value = "form1616a", required = false) MultipartFile form1616a,
//			@RequestPart(value = "aisAy", required = false) MultipartFile aisAy,
//			@RequestPart(value = "tis", required = false) MultipartFile tis,
//			@RequestPart(value = "bankStatement", required = false) MultipartFile bankStatement,
//			@RequestPart(value = "supportingIncomeDocuments", required = false) MultipartFile supportingIncomeDocuments,
//			@RequestPart(value = "supportingExpenseDocuments", required = false) MultipartFile supportingExpenseDocuments,
//			@RequestPart(value = "previousTaxResponses", required = false) MultipartFile previousTaxResponses,
//			@RequestPart(value = "otherNoticeSpecificDocuments", required = false) MultipartFile otherNoticeSpecificDocuments)
//			throws IOException {
//
//		TaxNoticeDocumentDto dto = new TaxNoticeDocumentDto();
//
//		if (data != null && !data.isEmpty()) {
//			dto = objectMapper.readValue(data, TaxNoticeDocumentDto.class);
//		}
//
//		String result = taxNoticeDocumentService.registerDocuments(noticeId, dto, taxNotice, previousItr,
//				itrAcknowledgement, form1616a, aisAy, tis, bankStatement, supportingIncomeDocuments,
//				supportingExpenseDocuments, previousTaxResponses, otherNoticeSpecificDocuments);
//
//		return new ResponseEntity<>(result, HttpStatus.CREATED);
//	}
//
//	@GetMapping("/{documentId}/documents")
//	public ResponseEntity<TaxNoticeDocumentDto> getDocuments(@PathVariable String documentId) {
//
//		TaxNoticeDocumentDto documents = taxNoticeDocumentService.getDocuments(documentId);
//
//		return ResponseEntity.ok(documents);
//	}
//
//	@PutMapping("/{documentId}/documents/update")
//	public ResponseEntity<String> updateDocuments(@PathVariable String documentId,
//			@RequestPart(value = "data", required = false) String data,
//			@RequestPart(value = "taxNotice", required = false) MultipartFile taxNotice,
//			@RequestPart(value = "previousItr", required = false) MultipartFile previousItr,
//			@RequestPart(value = "itrAcknowledgement", required = false) MultipartFile itrAcknowledgement,
//			@RequestPart(value = "form1616a", required = false) MultipartFile form1616a,
//			@RequestPart(value = "aisAy", required = false) MultipartFile aisAy,
//			@RequestPart(value = "tis", required = false) MultipartFile tis,
//			@RequestPart(value = "bankStatement", required = false) MultipartFile bankStatement,
//			@RequestPart(value = "supportingIncomeDocuments", required = false) MultipartFile supportingIncomeDocuments,
//			@RequestPart(value = "supportingExpenseDocuments", required = false) MultipartFile supportingExpenseDocuments,
//			@RequestPart(value = "previousTaxResponses", required = false) MultipartFile previousTaxResponses,
//			@RequestPart(value = "otherNoticeSpecificDocuments", required = false) MultipartFile otherNoticeSpecificDocuments)
//			throws IOException {
//
//		TaxNoticeDocumentDto dto = new TaxNoticeDocumentDto();
//
//		if (data != null && !data.isEmpty()) {
//			dto = objectMapper.readValue(data, TaxNoticeDocumentDto.class);
//		}
//
//		String result = taxNoticeDocumentService.updateDocuments(documentId, dto, taxNotice, previousItr,
//				itrAcknowledgement, form1616a, aisAy, tis, bankStatement, supportingIncomeDocuments,
//				supportingExpenseDocuments, previousTaxResponses, otherNoticeSpecificDocuments);
//
//		return ResponseEntity.ok(result);
//	}
//}