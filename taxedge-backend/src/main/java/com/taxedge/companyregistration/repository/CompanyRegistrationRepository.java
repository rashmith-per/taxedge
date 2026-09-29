package com.taxedge.companyregistration.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.taxedge.companyregistration.entity.CompanyRegistration;

public interface CompanyRegistrationRepository extends JpaRepository<CompanyRegistration, Long> {
    List<CompanyRegistration> findAllByUserIdOrderByCreatedAtDesc(String userId);
    Optional<CompanyRegistration> findByIdAndUserId(Long id, String userId);
}
