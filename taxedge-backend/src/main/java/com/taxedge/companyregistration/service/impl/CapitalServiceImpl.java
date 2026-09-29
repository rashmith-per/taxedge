package com.taxedge.companyregistration.service.impl;

import com.taxedge.companyregistration.dto.request.CapitalRequest;
import com.taxedge.companyregistration.dto.request.ShareholdingRequest;
import com.taxedge.companyregistration.service.CapitalService;
import com.taxedge.companyregistration.service.CompanyRegistrationService;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class CapitalServiceImpl implements CapitalService {
    private final CompanyRegistrationService registrations;

    public CapitalServiceImpl(CompanyRegistrationService registrations) {
        this.registrations = registrations;
    }

    @Override public Map<String, Object> updateCapital(Long id, CapitalRequest request) { return registrations.updateCapital(id, request); }
    @Override public List<Map<String, Object>> shareholdings(Long id) { return registrations.shareholdings(id); }
    @Override public Map<String, Object> addShareholding(Long id, ShareholdingRequest request) { return registrations.addShareholding(id, request); }
    @Override public Map<String, Object> updateShareholding(Long id, Long shareholdingId, ShareholdingRequest request) { return registrations.updateShareholding(id, shareholdingId, request); }
    @Override public void deleteShareholding(Long id, Long shareholdingId) { registrations.deleteShareholding(id, shareholdingId); }
}