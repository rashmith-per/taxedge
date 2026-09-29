package com.taxedge.loan.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taxedge.loan.entity.BusinessLoanApplication;

public interface BusinessLoanApplicationRepository
        extends JpaRepository<BusinessLoanApplication, String> {
}