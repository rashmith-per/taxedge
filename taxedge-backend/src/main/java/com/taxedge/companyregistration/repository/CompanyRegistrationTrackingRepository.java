package com.taxedge.companyregistration.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.taxedge.companyregistration.entity.CompanyRegistrationTracking;

public interface CompanyRegistrationTrackingRepository extends JpaRepository<CompanyRegistrationTracking, Long> {
    List<CompanyRegistrationTracking> findAllByRegistrationIdOrderByIdAsc(Long registrationId);
}
