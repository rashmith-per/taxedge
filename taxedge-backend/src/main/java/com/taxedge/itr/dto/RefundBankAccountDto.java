package com.taxedge.itr.dto;

import com.taxedge.gst.enums.AccountType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundBankAccountDto {

	private String id;
    private String custId;
    private String accountHolderName;
    private String accountNumber;
    private String confirmAccountNumber;
    private String ifscCode;
    private String bankName;
    private String branchName;
    private AccountType accountType;

   
}