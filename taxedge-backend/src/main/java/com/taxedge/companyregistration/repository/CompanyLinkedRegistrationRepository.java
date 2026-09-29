package com.taxedge.companyregistration.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.taxedge.companyregistration.entity.CompanyLinkedRegistration;

public interface CompanyLinkedRegistrationRepository extends JpaRepository<CompanyLinkedRegistration, Long> {
    Optional<CompanyLinkedRegistration> findByRegistrationId(Long registrationId);
}
