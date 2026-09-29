package com.taxedge.gst.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.taxedge.gst.dto.LegalNameAmendmentViewDto;
import com.taxedge.gst.entity.Business;
import com.taxedge.gst.entity.LegalNameAmendmentEntity;
import com.taxedge.gst.exception.ResourceNotFoundException;
import com.taxedge.gst.repository.BusinessRepository;
import com.taxedge.gst.repository.LegalNameAmendmentRepository;

import java.io.IOException;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class LegalNameAmendmentServiceImpl implements LegalNameAmendmentService {

    private final BusinessRepository businessRepository;
    private final LegalNameAmendmentRepository amendmentRepository;

    private Business resolveBusiness(String gstId) {
        return businessRepository.findById(gstId)
                .orElseGet(() -> businessRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("No registered business found in the system.")));
    }

    @Override
    public LegalNameAmendmentViewDto getExistingLegalNameDetails(String gstId) {
        Business business = resolveBusiness(gstId);

        return LegalNameAmendmentViewDto.builder()
                .newLegalName(business.getLegalName())
                .build();
    }

    @Override
    @Transactional
    public String submitLegalNameAmendment(String gstId, String newLegalName, MultipartFile file) throws IOException {
        Business business = resolveBusiness(gstId);

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Supporting document is required for legal name amendment");
        }

        String base64Data = Base64.getEncoder().encodeToString(file.getBytes());

        LegalNameAmendmentEntity amendment = LegalNameAmendmentEntity.builder()
                .business(business)
                .newLegalName(newLegalName)
                .imageData(base64Data)
                .build();

        amendmentRepository.save(amendment);

        return "Legal name amendment submitted successfully and is pending agent review.";
    }
}
