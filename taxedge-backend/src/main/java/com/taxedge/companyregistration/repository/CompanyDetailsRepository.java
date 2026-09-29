package com.taxedge.companyregistration.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.taxedge.companyregistration.entity.CompanyDetails;

public interface CompanyDetailsRepository extends JpaRepository<CompanyDetails, Long> {
    Optional<CompanyDetails> findByRegistrationId(Long registrationId);
    boolean existsByProposedName1IgnoreCaseOrProposedName2IgnoreCase(String firstName, String secondName);
}
