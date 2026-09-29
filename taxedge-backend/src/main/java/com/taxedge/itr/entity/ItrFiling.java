package com.taxedge.itr.entity;

import java.util.List;

import com.taxedge.customer.entity.Customer;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "itr_filing")
@Data
public class ItrFiling {

	@Id
	@Column(name = "itr_id", nullable = false, unique = true)
	private String itrId;

	@Column(name = "assessment_year", nullable = false)
	private String assessmentYear;

	@Column(name = "residential_status", nullable = false)
	private String residentialStatus;

	@Column(name = "filing_type", nullable = false)
	private String filingType;

	@Column(name = "bank_name", nullable = false)
	private String bankName;

	@Column(name = "account_number", nullable = false)
	private String accountNumber;

	@Column(name = "ifsc_code", nullable = false)
	private String ifscCode;

	@ManyToOne
	@JoinColumn(name = "cust_id", nullable = false)
	private Customer customer;

	@OneToMany(mappedBy = "itrFiling", cascade = CascadeType.ALL)
	private List<ItrDocument> documents;
}