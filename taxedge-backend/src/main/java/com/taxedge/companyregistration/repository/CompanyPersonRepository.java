package com.taxedge.companyregistration.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.taxedge.companyregistration.entity.CompanyPerson;

public interface CompanyPersonRepository extends JpaRepository<CompanyPerson, Long> {
    List<CompanyPerson> findAllByRegistrationIdOrderByIdAsc(Long registrationId);
}
