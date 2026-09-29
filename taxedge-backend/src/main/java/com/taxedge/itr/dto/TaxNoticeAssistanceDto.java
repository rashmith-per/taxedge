package com.taxedge.itr.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class TaxNoticeAssistanceDto {
   
	private String custId;
	
    private String permanentAccountNumber;

    private String assessmentYear;

    private String noticeTypeSection;

    private LocalDate noticeDate;

    private String noticeReferenceNumberDin;

    private LocalDate responseDueDate;

    private String message;

    private String fileName;

    private String fileType;

    private String noticeDocument;
}