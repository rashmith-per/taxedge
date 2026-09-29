//package com.taxedge.itr.controller;
//
//import java.io.IOException;
//import java.util.List;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.DeleteMapping;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.PutMapping;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.web.bind.annotation.RestController;
//import org.springframework.web.multipart.MultipartFile;
//
//import com.taxedge.itr.dto.RevisedItrDocumentDto;
//import com.taxedge.itr.service.RevisedItrDocumentService;
//
//@RestController
//@RequestMapping("/api/v1/itr/revised")
//public class RevisedItrDocumentController {
//
//	@Autowired
//	private RevisedItrDocumentService revisedItrDocumentService;
//
//	@PostMapping("/{revisedItrId}/document/register")
//	public ResponseEntity<String> registerDocument(@PathVariable String revisedItrId,
//			@RequestParam("documentType") String documentType, @RequestParam("file") MultipartFile file)
//			throws IOException {
//
//		String result = revisedItrDocumentService.registerDocument(revisedItrId, documentType, file);
//
//		return new ResponseEntity<>(result, HttpStatus.CREATED);
//	}
//
//	@GetMapping("/document/{documentId}")
//	public ResponseEntity<RevisedItrDocumentDto> getDocument(@PathVariable String documentId) {
//
//		RevisedItrDocumentDto document = revisedItrDocumentService.getDocument(documentId);
//
//		return ResponseEntity.ok(document);
//	}
//
//	@GetMapping("/{revisedItrId}/documents")
//	public ResponseEntity<List<RevisedItrDocumentDto>> getDocuments(@PathVariable String revisedItrId) {
//
//		List<RevisedItrDocumentDto> documents = revisedItrDocumentService.getDocuments(revisedItrId);
//
//		return ResponseEntity.ok(documents);
//	}
//
//	@PutMapping("/document/update/{documentId}")
//	public ResponseEntity<String> updateDocument(@PathVariable String documentId,
//			@RequestParam("file") MultipartFile file) throws IOException {
//
//		String result = revisedItrDocumentService.updateDocument(documentId, file);
//
//		return ResponseEntity.ok(result);
//	}
//
//	@DeleteMapping("/document/delete/{documentId}")
//	public ResponseEntity<String> deleteDocument(@PathVariable String documentId) {
//
//		String result = revisedItrDocumentService.deleteDocument(documentId);
//
//		return ResponseEntity.ok(result);
//	}
//}