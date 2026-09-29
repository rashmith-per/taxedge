package com.taxedge.loan.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taxedge.loan.entity.BusinessLoanDocument;

public interface BusinessLoanDocumentRepository extends JpaRepository<BusinessLoanDocument, Long> {

    Optional<BusinessLoanDocument> findByLoanApplication_Id(String loanApplicationId);

    boolean existsByLoanApplication_Id(String loanApplicationId);

    void deleteByLoanApplication_Id(String loanApplicationId);
}
