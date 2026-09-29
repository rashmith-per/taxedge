package com.taxedge.loan.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taxedge.loan.entity.BusinessLoanProfile;

public interface BusinessLoanProfileRepository extends JpaRepository<BusinessLoanProfile, Long> {

    Optional<BusinessLoanProfile> findByLoanApplication_Id(String loanApplicationId);
}