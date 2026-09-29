package com.taxedge.companyregistration.controller;

import com.taxedge.companyregistration.dto.request.PersonRequest;
import com.taxedge.companyregistration.service.PersonService;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/company-registrations/{id}/persons")
public class PersonController {
    private final PersonService service;

    public PersonController(PersonService service) {
        this.service = service;
    }

    @GetMapping
    public List<Map<String, Object>> list(@PathVariable Long id) {
        return service.persons(id);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> add(@PathVariable Long id, @RequestBody PersonRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.addPerson(id, request));
    }

    @PutMapping("/{personId}")
    public Map<String, Object> update(@PathVariable Long id, @PathVariable Long personId, @RequestBody PersonRequest request) {
        return service.updatePerson(id, personId, request);
    }

    @DeleteMapping("/{personId}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @PathVariable Long personId) {
        service.deletePerson(id, personId);
        return ResponseEntity.noContent().build();
    }
}