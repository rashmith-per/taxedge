package com.taxedge.loan.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taxedge.loan.dto.BusinessLoanApplicationDto;
import com.taxedge.loan.dto.BusinessLoanBankingDto;
import com.taxedge.loan.dto.BusinessLoanDocumentDto;
import com.taxedge.loan.dto.BusinessLoanProfileDto;
import com.taxedge.loan.service.BusinessLoanApplicationService;
import com.taxedge.loan.service.BusinessLoanBankingService;
import com.taxedge.loan.service.BusinessLoanDocumentService;
import com.taxedge.loan.service.BusinessLoanProfileService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/loan/business")
@RequiredArgsConstructor
public class BusinessLoanController {

    private final BusinessLoanApplicationService service;

    private final BusinessLoanProfileService profileservice;

    private final BusinessLoanBankingService bankingservice;

    private final BusinessLoanDocumentService documentservice;

    @PostMapping("application/save")
    public ResponseEntity<String> save(@RequestBody BusinessLoanApplicationDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.saveApplication(dto));
    }

    @PutMapping("application/update/{id}")
    public ResponseEntity<String> update(@PathVariable String id,
                                         @RequestBody BusinessLoanApplicationDto dto) {
        return ResponseEntity.ok(service.updateApplication(id, dto));
    }

    @GetMapping("application/business/{id}")
    public ResponseEntity<BusinessLoanApplicationDto> get(@PathVariable String id) {
        return ResponseEntity.ok(service.getApplication(id));
    }

    @PostMapping("profile/save")
    public ResponseEntity<String> save(@RequestBody BusinessLoanProfileDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(profileservice.saveProfile(dto));
    }

    @PutMapping("profile/update/{loanApplicationId}")
    public ResponseEntity<String> update(@PathVariable String loanApplicationId,
                                         @RequestBody BusinessLoanProfileDto dto) {
        return ResponseEntity.ok(profileservice.updateProfile(loanApplicationId, dto));
    }

    @GetMapping("profile/{loanApplicationId}")
    public ResponseEntity<BusinessLoanProfileDto> getBusinessProfile(@PathVariable String loanApplicationId) {
        return ResponseEntity.ok(profileservice.getProfile(loanApplicationId));
    }

    @PostMapping("banking/save")
    public ResponseEntity<String> save(@RequestBody BusinessLoanBankingDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bankingservice.saveBanking(dto));
    }

    @PutMapping("banking/update/{loanApplicationId}")
    public ResponseEntity<String> update(@PathVariable String loanApplicationId,
                                         @RequestBody BusinessLoanBankingDto dto) {
        return ResponseEntity.ok(bankingservice.updateBanking(loanApplicationId, dto));
    }

    @GetMapping("banking/{loanApplicationId}")
    public ResponseEntity<BusinessLoanBankingDto> getbanking(@PathVariable String loanApplicationId) {
        return ResponseEntity.ok(bankingservice.getBanking(loanApplicationId));
    }

    @PostMapping("documents/save")
    public ResponseEntity<String> save(@RequestBody BusinessLoanDocumentDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(documentservice.saveDocuments(dto));
    }

    @PutMapping("documents/update/{loanApplicationId}")
    public ResponseEntity<String> update(@PathVariable String loanApplicationId,
                                         @RequestBody BusinessLoanDocumentDto dto) {
        return ResponseEntity.ok(documentservice.updateDocuments(loanApplicationId, dto));
    }

    @GetMapping("documents/{loanApplicationId}")
    public ResponseEntity<BusinessLoanDocumentDto> getdocuments(@PathVariable String loanApplicationId) {
        return ResponseEntity.ok(documentservice.getDocuments(loanApplicationId));
    }
}