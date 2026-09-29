package com.taxedge.gst.repository;

import com.taxedge.gst.entity.PrincipalPlaceAmendmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PrincipalPlaceAmendmentRepository extends JpaRepository<PrincipalPlaceAmendmentEntity, Long> {

    Optional<PrincipalPlaceAmendmentEntity> findByBusinessGstId(String gstId);
}
