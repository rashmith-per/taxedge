package com.taxedge.itr.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taxedge.itr.entity.TaxNoticeDocument;

@Repository
public interface TaxNoticeDocumentRepository extends JpaRepository<TaxNoticeDocument, String> {

	Optional<TaxNoticeDocument> findByTaxNoticeAssistanceNoticeId(String noticeId);
}