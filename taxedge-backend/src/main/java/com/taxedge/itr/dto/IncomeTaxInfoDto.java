package com.taxedge.itr.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;


import com.taxedge.itr.entity.RefundBankAccount;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncomeTaxInfoDto {
	private Long id;                                 
	private String tdsRefundId;

    private BigDecimal salaryIncome;

    
    private BigDecimal otherIncome;

   
    private BigDecimal interestIncome;

   

   
    private BigDecimal rentalIncome;

    
    private BigDecimal municipalTaxesPaid;

   

    
    private BigDecimal shortTermCapitalGains;

    
    private BigDecimal longTermCapitalGains;

   

    
    private BigDecimal grossTurnover;

    
    private BigDecimal netBusinessProfit;


    private BigDecimal homeLoanInterestSec24b;

   

  
    private BigDecimal deductions80C;

  
    private BigDecimal deductions80D;

    
    private LocalDateTime createdAt;

}
