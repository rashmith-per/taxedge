package com.taxedge.itr.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taxedge.itr.entity.TaxNoticeAssistance;

@Repository
public interface TaxNoticeAssistanceRepository
        extends JpaRepository<TaxNoticeAssistance, String> {
}