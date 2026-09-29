package com.taxedge.itr.dto;

import lombok.Data;

@Data
public class TaxNoticeDocumentDto {

    private String taxNotice;

    private String previousItr;

    private String itrAcknowledgement;

    private String form1616a;

    private String aisAy;

    private String tis;

    private String bankStatement;

    private String supportingIncomeDocuments;

    private String supportingExpenseDocuments;

    private String previousTaxResponses;

    private String otherNoticeSpecificDocuments;

    private String message;
}