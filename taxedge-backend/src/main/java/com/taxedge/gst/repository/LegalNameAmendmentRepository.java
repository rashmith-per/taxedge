package com.taxedge.gst.repository;

import com.taxedge.gst.entity.LegalNameAmendmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LegalNameAmendmentRepository extends JpaRepository<LegalNameAmendmentEntity, Long> {
    Optional<LegalNameAmendmentEntity> findByBusinessGstId(String gstId);
}
