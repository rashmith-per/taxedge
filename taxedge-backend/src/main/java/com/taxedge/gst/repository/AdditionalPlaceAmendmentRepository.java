package com.taxedge.gst.repository;

import com.taxedge.gst.entity.AdditionalPlaceAmendmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdditionalPlaceAmendmentRepository extends JpaRepository<AdditionalPlaceAmendmentEntity, Long> {

    List<AdditionalPlaceAmendmentEntity> findByBusinessGstId(String gstId);
}
