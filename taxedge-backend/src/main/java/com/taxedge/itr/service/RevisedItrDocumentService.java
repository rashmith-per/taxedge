package com.taxedge.itr.service;

import org.springframework.web.multipart.MultipartFile;

import com.taxedge.itr.dto.RevisedItrDocumentDto;

public interface RevisedItrDocumentService {

	String registerDocuments(String revisedItrId, MultipartFile panCard, MultipartFile aadhaarCard,
			MultipartFile form16Form16A, MultipartFile aisTisStatement, MultipartFile bankStatements,
			MultipartFile investmentProofs) throws Exception;

	String updateDocuments(String documentId, MultipartFile panCard, MultipartFile aadhaarCard,
			MultipartFile form16Form16A, MultipartFile aisTisStatement, MultipartFile bankStatements,
			MultipartFile investmentProofs) throws Exception;

	String deleteDocuments(String documentId);

	RevisedItrDocumentDto getDocuments(String documentId);
}