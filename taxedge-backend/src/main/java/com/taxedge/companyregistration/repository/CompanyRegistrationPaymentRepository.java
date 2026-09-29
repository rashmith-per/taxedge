package com.taxedge.companyregistration.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.taxedge.companyregistration.entity.CompanyRegistrationPayment;

public interface CompanyRegistrationPaymentRepository extends JpaRepository<CompanyRegistrationPayment, Long> {
    List<CompanyRegistrationPayment> findAllByRegistrationIdOrderByCreatedAtDesc(Long registrationId);
}
