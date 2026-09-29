package com.taxedge.itr.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "tax_notice_document")
@Data
public class TaxNoticeDocument {

    @Id
    @Column(name = "document_id", nullable = false, unique = true)
    private String documentId;

    @OneToOne
    @JoinColumn(name = "notice_id", nullable = false)
    private TaxNoticeAssistance taxNoticeAssistance;

    @Column(name = "tax_notice", columnDefinition = "LONGTEXT")
    private String taxNotice;

    @Column(name = "previous_itr", columnDefinition = "LONGTEXT")
    private String previousItr;

    @Column(name = "itr_acknowledgement", columnDefinition = "LONGTEXT")
    private String itrAcknowledgement;

    @Column(name = "form_16_16a", columnDefinition = "LONGTEXT")
    private String form1616a;

    @Column(name = "ais_ay", columnDefinition = "LONGTEXT")
    private String aisAy;

    @Column(name = "tis", columnDefinition = "LONGTEXT")
    private String tis;

    @Column(name = "bank_statement", columnDefinition = "LONGTEXT")
    private String bankStatement;

    @Column(name = "supporting_income_documents", columnDefinition = "LONGTEXT")
    private String supportingIncomeDocuments;

    @Column(name = "supporting_expense_documents", columnDefinition = "LONGTEXT")
    private String supportingExpenseDocuments;

    @Column(name = "previous_tax_responses", columnDefinition = "LONGTEXT")
    private String previousTaxResponses;

    @Column(name = "other_notice_specific_documents", columnDefinition = "LONGTEXT")
    private String otherNoticeSpecificDocuments;

    @Column(name = "message")
    private String message;
}