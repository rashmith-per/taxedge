package com.taxedge.myapplications.gst.service;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.taxedge.gst.registration.entity.Business;
import com.taxedge.gst.registration.entity.Documents;
import com.taxedge.gst.registration.repository.BusinessRepository;
import com.taxedge.myapplications.gst.dto.MyApplicationResponseDto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class MyApplicationsServiceImpl implements MyApplicationsService {

    private final BusinessRepository businessRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MyApplicationResponseDto> getMyApplications(String custId) {
        if (!StringUtils.hasText(custId)) {
            log.warn("getMyApplications requested with empty custId");
            return Collections.emptyList();
        }

        List<Business> applications = businessRepository.findSubmittedByCustId(custId);
        return applications.stream()
                .map(this::toResponseDto)
                .toList();
    }

    private MyApplicationResponseDto toResponseDto(Business business) {
        Documents docs = business.getDocuments();

        return MyApplicationResponseDto.builder()
                .gstId(business.getGstId())
                .applicationType("GST_REGISTRATION")
                .status(business.getStatus())
                .assignedAgentId(business.getAssignedAgent() != null ? business.getAssignedAgent().getId() : null)
                .createdAt(business.getCreatedAt())
                .updatedAt(business.getUpdatedAt())
                .submittedAt(business.getSubmittedAt())

                // Step 1: Business Details
                .legalName(business.getLegalName())
                .tradeName(business.getTradeName())
                .constitutionOfBusiness(business.getConstitutionOfBusiness())
                .natureOfBusiness(business.getNatureOfBusiness())
                .dateOfCommencement(business.getDateOfCommencement())
                .businessPan(business.getBusinessPan())
                .reasonForRegistration(business.getReasonForRegistration())
                .compositionScheme(business.getCompositionScheme())
                .placeOfBusiness(business.getPlaceOfBusiness())
                .businessAddress(business.getBusinessAddress())
                .city(business.getCity())
                .district(business.getDistrict())
                .state(business.getState())
                .pinCode(business.getPinCode())
                .hsnSac(business.getHsnSac())

                // Bank Details
                .accountHolderName(business.getAccountHolderName())
                .bankAccountNumber(business.getBankAccountNumber())
                .ifscCode(business.getIfscCode())
                .bankName(business.getBankName())
                .branchName(business.getBranchName())
                .accountType(business.getAccountType())

                // Signatory Details
                .authorisedSignatory(business.getAuthorisedSignatory())
                .signatoryName(business.getSignatoryName())
                .signatoryPan(business.getSignatoryPan())
                .signatoryDob(business.getSignatoryDob())
                .designation(business.getDesignation())
                .signatoryMobile(business.getSignatoryMobile())
                .signatoryEmail(business.getSignatoryEmail())

                // Step 2: Documents Details
                .documentId(docs != null ? docs.getDocumentId() : null)
                .principalPlaceAddressType(docs != null ? docs.getPrincipalPlaceAddressType() : null)
                .panCardUploaded(docs != null && docs.getPanCard() != null && docs.getPanCard().length > 0)
                .aadhaarCardUploaded(docs != null && docs.getAadhaarCard() != null && docs.getAadhaarCard().length > 0)
                .businessRegistrationProofUploaded(docs != null && docs.getBusinessRegistrationProof() != null && docs.getBusinessRegistrationProof().length > 0)
                .principalPlaceAddressProofUploaded(docs != null && docs.getPrincipalPlaceAddressProof() != null && docs.getPrincipalPlaceAddressProof().length > 0)
                .bankPassbookOrCancelledChequeUploaded(docs != null && docs.getBankPassbookOrCancelledCheque() != null && docs.getBankPassbookOrCancelledCheque().length > 0)
                .passportSizePhotographUploaded(docs != null && docs.getPassportSizePhotograph() != null && docs.getPassportSizePhotograph().length > 0)
                .build();
    }
}
