package com.taxedge.companyregistration.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.taxedge.companyregistration.entity.CompanyRegisteredOffice;

public interface CompanyRegisteredOfficeRepository extends JpaRepository<CompanyRegisteredOffice, Long> {
    Optional<CompanyRegisteredOffice> findByRegistrationId(Long registrationId);
}
