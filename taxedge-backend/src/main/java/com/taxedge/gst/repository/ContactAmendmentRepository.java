package com.taxedge.gst.repository;

import com.taxedge.gst.entity.ContactAmendmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ContactAmendmentRepository extends JpaRepository<ContactAmendmentEntity, Long> {

    Optional<ContactAmendmentEntity> findByBusinessGstId(String gstId);
}
