package com.taxedge.companyregistration.service;

import com.taxedge.companyregistration.dto.request.CapitalRequest;
import com.taxedge.companyregistration.dto.request.ShareholdingRequest;
import java.util.List;
import java.util.Map;

public interface CapitalService {
    Map<String, Object> updateCapital(Long registrationId, CapitalRequest request);
    List<Map<String, Object>> shareholdings(Long registrationId);
    Map<String, Object> addShareholding(Long registrationId, ShareholdingRequest request);
    Map<String, Object> updateShareholding(Long registrationId, Long shareholdingId, ShareholdingRequest request);
    void deleteShareholding(Long registrationId, Long shareholdingId);
}