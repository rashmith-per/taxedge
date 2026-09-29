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
//import com.taxedge.itr.dto.RevisedItrDetailsDto;
//import com.taxedge.itr.service.RevisedItrDetailsService;
//
//@RestController
//@RequestMapping("/api/v1/itr/revised/details")
//public class RevisedItrDetailsController {
//
//	@Autowired
//	private RevisedItrDetailsService revisedItrDetailsService;
//
//	@GetMapping("/{detailsId}")
//	public ResponseEntity<RevisedItrDetailsDto> getRevisedItrDetails(@PathVariable String detailsId) {
//
//		RevisedItrDetailsDto details = revisedItrDetailsService.getRevisedItrDetails(detailsId);
//
//		return ResponseEntity.ok(details);
//	}
//
//	@PostMapping("/register")
//	public ResponseEntity<String> registerRevisedItrDetails(@RequestBody RevisedItrDetailsDto dto) {
//
//		String result = revisedItrDetailsService.createRevisedItrDetails(dto);
//
//		return new ResponseEntity<>(result, HttpStatus.CREATED);
//	}
//
//	@PutMapping("/update/{detailsId}")
//	public ResponseEntity<String> updateRevisedItrDetails(@PathVariable String detailsId,
//			@RequestBody RevisedItrDetailsDto dto) {
//
//		String result = revisedItrDetailsService.updateRevisedItrDetails(detailsId, dto);
//
//		return ResponseEntity.ok(result);
//	}
//}