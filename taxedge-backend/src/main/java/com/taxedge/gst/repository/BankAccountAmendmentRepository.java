package com.taxedge.gst.repository;

import com.taxedge.gst.entity.BankAccountAmendmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BankAccountAmendmentRepository extends JpaRepository<BankAccountAmendmentEntity, Long> {

    Optional<BankAccountAmendmentEntity> findByBusinessGstId(String gstId);
}
