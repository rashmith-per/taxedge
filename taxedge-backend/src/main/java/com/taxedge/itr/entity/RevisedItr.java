package com.taxedge.itr.entity;

import com.taxedge.customer.entity.Customer;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "revised_itr")
@Data
public class RevisedItr {

	@Id
	@Column(name = "revised_itr_id", nullable = false, unique = true)
	private String revisedItrId;

	@Column(name = "itr_acknowledgement_number", nullable = false)
	private String itrAcknowledgementNumber;

	@Column(name = "assessment_year", nullable = false)
	private String assessmentYear;

	@ManyToOne
	@JoinColumn(name = "cust_id", nullable = false)
	private Customer customer;
}