package com.taxedge.companyregistration.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.taxedge.companyregistration.entity.CompanyRegistrationDocument;

public interface CompanyRegistrationDocumentRepository extends JpaRepository<CompanyRegistrationDocument, Long> {
    List<CompanyRegistrationDocument> findAllByRegistrationIdOrderByIdAsc(Long registrationId);
}
