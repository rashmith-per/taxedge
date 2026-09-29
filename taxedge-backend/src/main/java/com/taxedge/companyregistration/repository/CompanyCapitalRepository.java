package com.taxedge.companyregistration.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.taxedge.companyregistration.entity.CompanyCapital;

public interface CompanyCapitalRepository extends JpaRepository<CompanyCapital, Long> {
    Optional<CompanyCapital> findByRegistrationId(Long registrationId);
}
