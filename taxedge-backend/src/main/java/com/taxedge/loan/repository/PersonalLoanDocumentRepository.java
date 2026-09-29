package com.taxedge.loan.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taxedge.loan.entity.PersonalLoanDocument;

public interface PersonalLoanDocumentRepository extends JpaRepository<PersonalLoanDocument, Long> {

    Optional<PersonalLoanDocument> findByLoanApplication_Id(String loanApplicationId);

    boolean existsByLoanApplication_Id(String loanApplicationId);

   
}
