package com.taxedge.myapplications.gst.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.taxedge.gst.registration.enums.AccountType;
import com.taxedge.gst.registration.enums.CompositionScheme;
import com.taxedge.gst.registration.enums.ConstitutionOfBusiness;
import com.taxedge.gst.registration.enums.NatureOfBusiness;
import com.taxedge.gst.registration.enums.PlaceOfBusiness;
import com.taxedge.gst.registration.enums.PrincipalPlaceAddressType;
import com.taxedge.gst.registration.enums.ReasonForRegistration;
import com.taxedge.gst.registration.enums.RegisterationStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyApplicationResponseDto {

    // Identifiers & Status
    private String gstId;
    private String applicationType;
    private RegisterationStatus status;
    private Long assignedAgentId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime submittedAt;

    // Step 1: Business Details
    private String legalName;
    private String tradeName;
    private ConstitutionOfBusiness constitutionOfBusiness;
    private NatureOfBusiness natureOfBusiness;
    private LocalDate dateOfCommencement;
    private String businessPan;
    private ReasonForRegistration reasonForRegistration;
    private CompositionScheme compositionScheme;
    private PlaceOfBusiness placeOfBusiness;
    private String businessAddress;
    private String city;
    private String district;
    private String state;
    private String pinCode;
    private String hsnSac;

    // Bank Details
    private String accountHolderName;
    private String bankAccountNumber;
    private String ifscCode;
    private String bankName;
    private String branchName;
    private AccountType accountType;

    // Authorised Signatory Details
    private String authorisedSignatory;
    private String signatoryName;
    private String signatoryPan;
    private LocalDate signatoryDob;
    private String designation;
    private String signatoryMobile;
    private String signatoryEmail;

    // Step 2: Documents Details (Uploaded status and type)
    private String documentId;
    private PrincipalPlaceAddressType principalPlaceAddressType;
    private boolean panCardUploaded;
    private boolean aadhaarCardUploaded;
    private boolean businessRegistrationProofUploaded;
    private boolean principalPlaceAddressProofUploaded;
    private boolean bankPassbookOrCancelledChequeUploaded;
    private boolean passportSizePhotographUploaded;
}
