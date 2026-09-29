package com.taxedge.itr.service;

import java.io.IOException;

import org.springframework.web.multipart.MultipartFile;

import com.taxedge.itr.dto.TaxNoticeDocumentDto;

public interface TaxNoticeDocumentService {

	String registerDocuments(String noticeId, String data, MultipartFile taxNotice, MultipartFile previousItr,
			MultipartFile itrAcknowledgement, MultipartFile form1616a, MultipartFile aisAy, MultipartFile tis,
			MultipartFile bankStatement, MultipartFile supportingIncomeDocuments,
			MultipartFile supportingExpenseDocuments, MultipartFile previousTaxResponses,
			MultipartFile otherNoticeSpecificDocuments) throws IOException;

	String updateDocuments(String documentId, String data, MultipartFile taxNotice, MultipartFile previousItr,
			MultipartFile itrAcknowledgement, MultipartFile form1616a, MultipartFile aisAy, MultipartFile tis,
			MultipartFile bankStatement, MultipartFile supportingIncomeDocuments,
			MultipartFile supportingExpenseDocuments, MultipartFile previousTaxResponses,
			MultipartFile otherNoticeSpecificDocuments) throws IOException;

	TaxNoticeDocumentDto getDocuments(String documentId);
}