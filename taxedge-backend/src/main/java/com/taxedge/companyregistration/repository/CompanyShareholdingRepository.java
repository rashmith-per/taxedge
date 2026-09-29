package com.taxedge.companyregistration.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.taxedge.companyregistration.entity.CompanyShareholding;

public interface CompanyShareholdingRepository extends JpaRepository<CompanyShareholding, Long> {
    List<CompanyShareholding> findAllByRegistrationIdOrderByIdAsc(Long registrationId);
}
