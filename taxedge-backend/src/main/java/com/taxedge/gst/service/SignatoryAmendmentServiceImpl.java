package com.taxedge.gst.service;

import com.taxedge.gst.dto.SignatoryAmendmentViewDto;
import com.taxedge.gst.entity.Business;
import com.taxedge.gst.entity.SignatoryAmendmentEntity;
import com.taxedge.gst.exception.ResourceNotFoundException;
import com.taxedge.gst.repository.BusinessRepository;
import com.taxedge.gst.repository.SignatoryAmendmentRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class SignatoryAmendmentServiceImpl implements SignatoryAmendmentService {

    private final BusinessRepository businessRepository;
    private final SignatoryAmendmentRepository signatoryAmendmentRepository;

    private Business resolveBusiness(String gstId) {
        return businessRepository.findById(gstId)
                .orElseGet(() -> businessRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("No registered business found in the system.")));
    }

    @Override
    public SignatoryAmendmentViewDto getExistingSignatoryDetails(String gstId) {
        Business business = resolveBusiness(gstId);

        return SignatoryAmendmentViewDto.builder()
                .newSignatoryName(business.getSignatoryName())
                .newSignatoryPan(business.getSignatoryPan())
                .newSignatoryDob(business.getSignatoryDob())
                .newDesignation(business.getDesignation())
                .newSignatoryMobile(business.getSignatoryMobile())
                .newSignatoryEmail(business.getSignatoryEmail())
                .build();
    }

    @Override
    @Transactional
    public String submitSignatoryAmendment(String gstId, String signatoryName, String signatoryPan,
                                           LocalDate signatoryDob, String designation, String signatoryMobile,
                                           String signatoryEmail, MultipartFile file) throws IOException {

        Business business = resolveBusiness(gstId);

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Supporting proof document is required for authorized signatory amendment");
        }

        String base64Data = Base64.getEncoder().encodeToString(file.getBytes());

        SignatoryAmendmentEntity amendment = SignatoryAmendmentEntity.builder()
                .business(business)
                .newSignatoryName(signatoryName)
                .newSignatoryPan(signatoryPan)
                .newSignatoryDob(signatoryDob)
                .newDesignation(designation)
                .newSignatoryMobile(signatoryMobile)
                .newSignatoryEmail(signatoryEmail)
                .imageData(base64Data)
                .build();

        signatoryAmendmentRepository.save(amendment);

        return "Authorized signatory amendment submitted successfully and is pending agent review.";
    }
}
