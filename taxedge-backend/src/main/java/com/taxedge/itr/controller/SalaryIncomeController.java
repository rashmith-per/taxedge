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
//import com.taxedge.itr.dto.SalaryIncomeDto;
//import com.taxedge.itr.service.SalaryIncomeService;
//
//@RestController
//@RequestMapping("/api/v1/itr")
//public class SalaryIncomeController {
//
//    @Autowired
//    private SalaryIncomeService salaryIncomeService;
//
//    @PostMapping("/{itrId}/salary-income/register")
//    public ResponseEntity<String> registerSalaryIncome(
//            @PathVariable String itrId,
//            @RequestBody SalaryIncomeDto salaryIncomeDto) {
//
//        String result =
//                salaryIncomeService.registerSalaryIncome(
//                        itrId, salaryIncomeDto);
//
//        return new ResponseEntity<>(result, HttpStatus.CREATED);
//    }
//
//    @GetMapping("/salary-income/{incomeId}")
//    public ResponseEntity<SalaryIncomeDto> getSalaryIncome(
//            @PathVariable String incomeId) {
//
//        SalaryIncomeDto salaryIncome =
//                salaryIncomeService.getSalaryIncome(incomeId);
//
//        return ResponseEntity.ok(salaryIncome);
//    }
//
//    @PutMapping("/salary-income/update/{incomeId}")
//    public ResponseEntity<String> updateSalaryIncome(
//            @PathVariable String incomeId,
//            @RequestBody SalaryIncomeDto salaryIncomeDto) {
//
//        String result =
//                salaryIncomeService.updateSalaryIncome(
//                        incomeId, salaryIncomeDto);
//
//        return ResponseEntity.ok(result);
//    }
//}