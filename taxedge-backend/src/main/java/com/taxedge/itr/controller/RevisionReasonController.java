//package com.taxedge.itr.controller;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.PutMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//import com.taxedge.itr.dto.RevisionReasonDto;
//import com.taxedge.itr.service.RevisionReasonService;
//
//@RestController
//@RequestMapping("/api/v1/itr/revised/reason")
//public class RevisionReasonController {
//
//	@Autowired
//	private RevisionReasonService revisionReasonService;
//
//	@GetMapping("/{revisionReasonId}")
//	public ResponseEntity<RevisionReasonDto> getRevisionReason(@PathVariable String revisionReasonId) {
//
//		RevisionReasonDto revisionReason = revisionReasonService.getRevisionReason(revisionReasonId);
//
//		return ResponseEntity.ok(revisionReason);
//	}
//
//	@PostMapping("/register")
//	public ResponseEntity<String> registerRevisionReason(@RequestBody RevisionReasonDto dto) {
//
//		String result = revisionReasonService.createRevisionReason(dto);
//
//		return new ResponseEntity<>(result, HttpStatus.CREATED);
//	}
//
//	@PutMapping("/update/{revisionReasonId}")
//	public ResponseEntity<String> updateRevisionReason(@PathVariable String revisionReasonId,
//			@RequestBody RevisionReasonDto dto) {
//
//		String result = revisionReasonService.updateRevisionReason(revisionReasonId, dto);
//
//		return ResponseEntity.ok(result);
//	}
//}