package com.taxedge.itr.service;

import java.io.IOException;

import org.springframework.web.multipart.MultipartFile;

import com.taxedge.itr.dto.TaxNoticeAssistanceDto;

public interface TaxNoticeAssistanceService {

	String createTaxNotice(TaxNoticeAssistanceDto dto, MultipartFile file) throws IOException;

	TaxNoticeAssistanceDto getTaxNotice(String noticeId);

	String updateTaxNotice(String noticeId, TaxNoticeAssistanceDto dto, MultipartFile file) throws IOException;
}