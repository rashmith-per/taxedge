package com.taxedge.itr.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taxedge.itr.entity.RevisedItrDetails;

@Repository
public interface RevisedItrDetailsRepository extends JpaRepository<RevisedItrDetails, String> {

	Optional<RevisedItrDetails> findByRevisedItrRevisedItrId(String revisedItrId);
}