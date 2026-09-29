package com.taxedge.companyregistration.service.impl;

import com.taxedge.companyregistration.dto.request.PersonRequest;
import com.taxedge.companyregistration.service.CompanyRegistrationService;
import com.taxedge.companyregistration.service.PersonService;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class PersonServiceImpl implements PersonService {
    private final CompanyRegistrationService registrations;

    public PersonServiceImpl(CompanyRegistrationService registrations) {
        this.registrations = registrations;
    }

    @Override public List<Map<String, Object>> persons(Long id) { return registrations.persons(id); }
    @Override public Map<String, Object> addPerson(Long id, PersonRequest request) { return registrations.addPerson(id, request); }
    @Override public Map<String, Object> updatePerson(Long id, Long personId, PersonRequest request) { return registrations.updatePerson(id, personId, request); }
    @Override public void deletePerson(Long id, Long personId) { registrations.deletePerson(id, personId); }
}