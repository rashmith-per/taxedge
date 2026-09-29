package com.taxedge.companyregistration.service;

import com.taxedge.companyregistration.dto.response.TrackingResponse;
import java.util.List;
import java.util.Map;

public interface ApplicationTrackingService {
    List<TrackingResponse> tracking(Long registrationId);
    Map<String, Object> status(Long registrationId);
}