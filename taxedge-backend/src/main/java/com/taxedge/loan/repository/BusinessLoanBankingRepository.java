package com.taxedge.loan.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taxedge.loan.entity.BusinessLoanBanking;

public interface BusinessLoanBankingRepository extends JpaRepository<BusinessLoanBanking, Long> {

    Optional<BusinessLoanBanking> findByLoanApplication_Id(String loanApplicationId);
}