package com.taxedge.companyregistration.service;

import com.taxedge.companyregistration.dto.request.PersonRequest;
import java.util.List;
import java.util.Map;

public interface PersonService {
    List<Map<String, Object>> persons(Long registrationId);
    Map<String, Object> addPerson(Long registrationId, PersonRequest request);
    Map<String, Object> updatePerson(Long registrationId, Long personId, PersonRequest request);
    void deletePerson(Long registrationId, Long personId);
}