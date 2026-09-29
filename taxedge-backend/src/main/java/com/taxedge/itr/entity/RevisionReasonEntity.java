package com.taxedge.itr.entity;

import com.taxedge.itr.enums.RevisionReason;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "revision_reason")
@Data
public class RevisionReasonEntity {

	@Id
	@Column(name = "revision_reason_id", nullable = false, unique = true)
	private String revisionReasonId;

	@Enumerated(EnumType.STRING)
	@Column(name = "reason", nullable = false)
	private RevisionReason reason;

	@Column(name = "other_reason")
	private String otherReason;

	@ManyToOne
	@JoinColumn(name = "revised_itr_id", nullable = false)
	private RevisedItr revisedItr;
}