package com.taxedge.myapplications.gst.gstamendment.service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Stream;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.taxedge.gst.amendment.entity.AdditionalPlaceAmendmentEntity;
import com.taxedge.gst.amendment.entity.BankAccountAmendmentEntity;
import com.taxedge.gst.amendment.entity.ContactAmendmentEntity;
import com.taxedge.gst.amendment.entity.LegalNameAmendmentEntity;
import com.taxedge.gst.amendment.entity.PrincipalPlaceAmendmentEntity;
import com.taxedge.gst.amendment.entity.SignatoryAmendmentEntity;
import com.taxedge.gst.amendment.repository.AdditionalPlaceAmendmentRepository;
import com.taxedge.gst.amendment.repository.BankAccountAmendmentRepository;
import com.taxedge.gst.amendment.repository.ContactAmendmentRepository;
import com.taxedge.gst.amendment.repository.LegalNameAmendmentRepository;
import com.taxedge.gst.amendment.repository.PrincipalPlaceAmendmentRepository;
import com.taxedge.gst.amendment.repository.SignatoryAmendmentRepository;
import com.taxedge.gst.registration.enums.RegisterationStatus;
import com.taxedge.myapplications.gst.gstamendment.dto.GstAmendmentMyApplicationResponseDto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class GstAmendmentMyApplicationsServiceImpl implements GstAmendmentMyApplicationsService {

    private final LegalNameAmendmentRepository legalNameRepo;
    private final PrincipalPlaceAmendmentRepository principalPlaceRepo;
    private final AdditionalPlaceAmendmentRepository additionalPlaceRepo;
    private final BankAccountAmendmentRepository bankAccountRepo;
    private final SignatoryAmendmentRepository signatoryRepo;
    private final ContactAmendmentRepository contactRepo;

    @Override
    @Transactional(readOnly = true)
    public List<GstAmendmentMyApplicationResponseDto> getMyAmendmentApplications(String custId) {
        if (!StringUtils.hasText(custId)) {
            log.warn("getMyAmendmentApplications called with empty custId");
            return Collections.emptyList();
        }

        // 1. Legal Name
        Stream<GstAmendmentMyApplicationResponseDto> legalNames = legalNameRepo.findByCustomerCustId(custId).stream()
                .filter(e -> e.getStatus() != RegisterationStatus.DRAFT)
                .map(e -> GstAmendmentMyApplicationResponseDto.builder()
                        .amendmentId(e.getId())
                        .gstNumber(e.getGstNumber())
                        .section("LEGAL_NAME")
                        .applicationType("GST_AMENDMENT")
                        .status(e.getStatus())
                        .assignedAgentId(e.getAssignedAgent() != null ? e.getAssignedAgent().getId() : null)
                        .createdAt(e.getCreatedAt())
                        .updatedAt(e.getUpdatedAt())
                        .submittedAt(e.getSubmittedAt())
                        .description("Legal Name Amendment")
                        .amendedValue(e.getNewLegalName())
                        .proofDocumentUploaded(e.getImageData() != null && e.getImageData().length > 0)
                        .build());

        // 2. Principal Place
        Stream<GstAmendmentMyApplicationResponseDto> principalPlaces = principalPlaceRepo.findByCustomerCustId(custId).stream()
                .filter(e -> e.getStatus() != RegisterationStatus.DRAFT)
                .map(e -> GstAmendmentMyApplicationResponseDto.builder()
                        .amendmentId(e.getId())
                        .gstNumber(e.getGstNumber())
                        .section("PRINCIPAL_PLACE")
                        .applicationType("GST_AMENDMENT")
                        .status(e.getStatus())
                        .assignedAgentId(e.getAssignedAgent() != null ? e.getAssignedAgent().getId() : null)
                        .createdAt(e.getCreatedAt())
                        .updatedAt(e.getUpdatedAt())
                        .submittedAt(e.getSubmittedAt())
                        .description("Principal Place Amendment")
                        .amendedValue(e.getNewBusinessAddress())
                        .proofDocumentUploaded(e.getImageData() != null && e.getImageData().length > 0)
                        .build());

        // 3. Additional Place
        Stream<GstAmendmentMyApplicationResponseDto> additionalPlaces = additionalPlaceRepo.findByCustomerCustId(custId).stream()
                .filter(e -> e.getStatus() != RegisterationStatus.DRAFT)
                .map(e -> GstAmendmentMyApplicationResponseDto.builder()
                        .amendmentId(e.getId())
                        .gstNumber(e.getGstNumber())
                        .section("ADDITIONAL_PLACE")
                        .applicationType("GST_AMENDMENT")
                        .status(e.getStatus())
                        .assignedAgentId(e.getAssignedAgent() != null ? e.getAssignedAgent().getId() : null)
                        .createdAt(e.getCreatedAt())
                        .updatedAt(e.getUpdatedAt())
                        .submittedAt(e.getSubmittedAt())
                        .description("Additional Place Amendment")
                        .amendedValue(e.getAddress())
                        .proofDocumentUploaded(e.getImageData() != null && e.getImageData().length > 0)
                        .build());

        // 4. Bank Account
        Stream<GstAmendmentMyApplicationResponseDto> bankAccounts = bankAccountRepo.findByCustomerCustId(custId).stream()
                .filter(e -> e.getStatus() != RegisterationStatus.DRAFT)
                .map(e -> GstAmendmentMyApplicationResponseDto.builder()
                        .amendmentId(e.getId())
                        .gstNumber(e.getGstNumber())
                        .section("BANK_ACCOUNT")
                        .applicationType("GST_AMENDMENT")
                        .status(e.getStatus())
                        .assignedAgentId(e.getAssignedAgent() != null ? e.getAssignedAgent().getId() : null)
                        .createdAt(e.getCreatedAt())
                        .updatedAt(e.getUpdatedAt())
                        .submittedAt(e.getSubmittedAt())
                        .description("Bank Account Amendment")
                        .amendedValue(e.getNewBankAccountNumber())
                        .proofDocumentUploaded(e.getImageData() != null && e.getImageData().length > 0)
                        .build());

        // 5. Signatory
        Stream<GstAmendmentMyApplicationResponseDto> signatories = signatoryRepo.findByCustomerCustId(custId).stream()
                .filter(e -> e.getStatus() != RegisterationStatus.DRAFT)
                .map(e -> GstAmendmentMyApplicationResponseDto.builder()
                        .amendmentId(e.getId())
                        .gstNumber(e.getGstNumber())
                        .section("SIGNATORY")
                        .applicationType("GST_AMENDMENT")
                        .status(e.getStatus())
                        .assignedAgentId(e.getAssignedAgent() != null ? e.getAssignedAgent().getId() : null)
                        .createdAt(e.getCreatedAt())
                        .updatedAt(e.getUpdatedAt())
                        .submittedAt(e.getSubmittedAt())
                        .description("Signatory Amendment")
                        .amendedValue(e.getNewSignatoryName())
                        .proofDocumentUploaded(e.getImageData() != null && e.getImageData().length > 0)
                        .build());

        // 6. Contact
        Stream<GstAmendmentMyApplicationResponseDto> contacts = contactRepo.findByCustomerCustId(custId).stream()
                .filter(e -> e.getStatus() != RegisterationStatus.DRAFT)
                .map(e -> GstAmendmentMyApplicationResponseDto.builder()
                        .amendmentId(e.getId())
                        .gstNumber(e.getGstNumber())
                        .section("CONTACT")
                        .applicationType("GST_AMENDMENT")
                        .status(e.getStatus())
                        .assignedAgentId(e.getAssignedAgent() != null ? e.getAssignedAgent().getId() : null)
                        .createdAt(e.getCreatedAt())
                        .updatedAt(e.getUpdatedAt())
                        .submittedAt(e.getSubmittedAt())
                        .description("Contact Amendment")
                        .amendedValue(e.getNewEmail())
                        .proofDocumentUploaded(e.getImageData() != null && e.getImageData().length > 0)
                        .build());

        return Stream.of(legalNames, principalPlaces, additionalPlaces, bankAccounts, signatories, contacts)
                .flatMap(s -> s)
                .sorted((a, b) -> {
                    if (a.getCreatedAt() == null || b.getCreatedAt() == null) return 0;
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                })
                .toList();
    }
}
