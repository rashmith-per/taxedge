package com.taxedge.loan.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taxedge.loan.entity.PersonalLoanApplication;

public interface PersonalLoanApplicationRepository
        extends JpaRepository<PersonalLoanApplication, String> {
}
