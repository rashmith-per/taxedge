//package com.taxedge.itr.controller;
//
//import java.io.IOException;
//import java.util.List;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.PutMapping;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.web.bind.annotation.RestController;
//import org.springframework.web.multipart.MultipartFile;
//
//import com.taxedge.itr.dto.DocumentDto;
//import com.taxedge.itr.service.ItrDocumentService;
//
//@RestController
//@RequestMapping("/api/v1/itr")
//public class ItrDocumentController {
//
//	@Autowired
//	private ItrDocumentService itrDocumentService;
//
//	@PostMapping("/{itrId}/document/register")
//	public ResponseEntity<String> registerDocument(@PathVariable String itrId,
//			@RequestParam("documentType") String documentType, @RequestParam("file") MultipartFile file)
//			throws IOException {
//
//		String result = itrDocumentService.registerDocument(itrId, documentType, file);
//
//		return new ResponseEntity<>(result, HttpStatus.CREATED);
//	}
//
//	@GetMapping("/document/{documentId}")
//	public ResponseEntity<DocumentDto> getDocument(@PathVariable String documentId) {
//
//		DocumentDto document = itrDocumentService.getDocument(documentId);
//
//		return ResponseEntity.ok(document);
//	}
//
//	@PutMapping("/document/update/{documentId}")
//	public ResponseEntity<String> updateDocument(@PathVariable String documentId,
//			@RequestParam("file") MultipartFile file) throws IOException {
//
//		String result = itrDocumentService.updateDocument(documentId, file);
//
//		return ResponseEntity.ok(result);
//	}
//
//	@GetMapping("/{itrId}/documents")
//	public ResponseEntity<List<DocumentDto>> getDocuments(@PathVariable String itrId) {
//
//		List<DocumentDto> documents = itrDocumentService.getDocuments(itrId);
//
//		return ResponseEntity.ok(documents);
//	}
//}