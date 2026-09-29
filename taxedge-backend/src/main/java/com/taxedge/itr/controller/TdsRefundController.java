package com.taxedge.itr.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taxedge.itr.dto.IncomeTaxInfoDto;
import com.taxedge.itr.dto.RefundBankAccountDto;
import com.taxedge.itr.dto.TdsDocumentsDto;
import com.taxedge.itr.dto.TdsTaxesPaidDto;
import com.taxedge.itr.service.IncomeTaxInfoService;
import com.taxedge.itr.service.RefundBankAccountService;
import com.taxedge.itr.service.TdsDocumentsService;
import com.taxedge.itr.service.TdsTaxesPaidService;

@RestController
@RequestMapping("/itr")
@RequiredArgsConstructor
public class TdsRefundController {
	
	private final RefundBankAccountService service;
	private final TdsTaxesPaidService tdsservice;
	private final IncomeTaxInfoService incomeservice;
	private final TdsDocumentsService docservice;
	
		@PostMapping("/refund-bank-account/save")
		public ResponseEntity<String> save(@RequestBody RefundBankAccountDto dto) {
			return new ResponseEntity<>(service.saveBankAccount(dto), HttpStatus.CREATED);
		}

		
		@PutMapping("/refund-bank-account/update/{id}")
		public ResponseEntity<String> update(@PathVariable String id,
                                     @RequestBody RefundBankAccountDto dto) {
			return ResponseEntity.ok(service.updateBankAccount(id, dto));
		}

		
		

	    

	    @PostMapping("/tds-taxes-paid/save")
	    public ResponseEntity<String> save(@RequestBody TdsTaxesPaidDto dto) {
	        return ResponseEntity.status(201).body(tdsservice.saveTaxesPaid(dto));
	    }

	    @PutMapping("/tds-taxes-paid/update/{id}")
	    public ResponseEntity<String> update(@PathVariable Long id,
	                                         @RequestBody TdsTaxesPaidDto dto) {
	        return ResponseEntity.ok(tdsservice.updateTaxesPaid(id, dto));
	    }
	    
	    @PostMapping("/income-tax-info/save")
	    public ResponseEntity<String> save(@RequestBody IncomeTaxInfoDto dto) {
	        return ResponseEntity.status(201).body(incomeservice.saveIncomeTaxInfo(dto));
	    }

	    @PutMapping("/income-tax-info/update/{id}")
	    public ResponseEntity<String> update(@PathVariable Long id,
	                                         @RequestBody IncomeTaxInfoDto dto) {
	        return ResponseEntity.ok(incomeservice.updateIncomeTaxInfo(id, dto));
	    }
	    
	    @PostMapping("/tds-documents/save")
	    public ResponseEntity<String> save(@RequestBody TdsDocumentsDto dto) {
	        return ResponseEntity.status(201).body(docservice.saveDocuments(dto));
	    }

	    @PutMapping("/tds-documents/update/{id}")
	    public ResponseEntity<String> update(@PathVariable Long id,
	                                         @RequestBody TdsDocumentsDto dto) {
	        return ResponseEntity.ok(docservice.updateDocuments(id, dto));
	    }
	    
	    
	    @GetMapping("/refund-bank-account/{id}")
	    public ResponseEntity<RefundBankAccountDto> getBankAccount(@PathVariable String id) {
	        return ResponseEntity.ok(service.getBankAccount(id));
	    }

	    @GetMapping("/refund-bank-account/customer/{custId}")
	    public ResponseEntity<RefundBankAccountDto> getBankAccountByCustomer(@PathVariable String custId) {
	        return ResponseEntity.ok(service.getBankAccountByCustId(custId));
	    }

	    @GetMapping("/tds-taxes-paid/{tdsRefundId}")
	    public ResponseEntity<TdsTaxesPaidDto> getTaxesPaid(@PathVariable String tdsRefundId) {
	        return ResponseEntity.ok(tdsservice.getTaxesPaid(tdsRefundId));
	    }

	    @GetMapping("/income-tax-info/{tdsRefundId}")
	    public ResponseEntity<IncomeTaxInfoDto> getIncomeTaxInfo(@PathVariable String tdsRefundId) {
	        return ResponseEntity.ok(incomeservice.getIncomeTaxInfo(tdsRefundId));
	    }

	    @GetMapping("/tds-documents/{tdsRefundId}")
	    public ResponseEntity<TdsDocumentsDto> getDocuments(@PathVariable String tdsRefundId) {
	        return ResponseEntity.ok(docservice.getDocuments(tdsRefundId));
	    }
}