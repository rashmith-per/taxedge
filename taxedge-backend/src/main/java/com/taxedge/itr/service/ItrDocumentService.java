package com.taxedge.itr.service;

import java.io.IOException;

import org.springframework.web.multipart.MultipartFile;

import com.taxedge.itr.dto.DocumentDto;

public interface ItrDocumentService {

	String registerDocuments(String itrId, MultipartFile form16PartAPartB, MultipartFile form26as, MultipartFile aisTis,
			MultipartFile bankAccountStatement, MultipartFile salaryPayslips) throws IOException;

	DocumentDto getDocuments(String documentId);

	String updateDocuments(String documentId, MultipartFile form16PartAPartB, MultipartFile form26as,
			MultipartFile aisTis, MultipartFile bankAccountStatement, MultipartFile salaryPayslips) throws IOException;

	String deleteDocuments(String documentId);
}