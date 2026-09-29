package com.taxedge.gst.service;

import com.taxedge.gst.dto.ContactAmendmentViewDto;
import com.taxedge.gst.entity.Business;
import com.taxedge.gst.entity.ContactAmendmentEntity;
import com.taxedge.gst.exception.ResourceNotFoundException;
import com.taxedge.gst.repository.BusinessRepository;
import com.taxedge.gst.repository.ContactAmendmentRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class ContactAmendmentServiceImpl implements ContactAmendmentService {

    private final BusinessRepository businessRepository;
    private final ContactAmendmentRepository contactAmendmentRepository;

    private Business resolveBusiness(String gstId) {
        return businessRepository.findById(gstId)
                .orElseGet(() -> businessRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("No registered business found in the system.")));
    }

    @Override
    public ContactAmendmentViewDto getExistingContactDetails(String gstId) {
        Business business = resolveBusiness(gstId);

        return ContactAmendmentViewDto.builder()
                .newMobileNumber(business.getSignatoryMobile())
                .newEmail(business.getSignatoryEmail())
                .build();
    }

    @Override
    @Transactional
    public String submitContactAmendment(String gstId, String mobileNumber, String email, MultipartFile file) throws IOException {
        Business business = resolveBusiness(gstId);

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Supporting proof document is required for contact details amendment");
        }

        String base64Data = Base64.getEncoder().encodeToString(file.getBytes());

        ContactAmendmentEntity amendment = ContactAmendmentEntity.builder()
                .business(business)
                .newMobileNumber(mobileNumber)
                .newEmail(email)
                .imageData(base64Data)
                .build();

        contactAmendmentRepository.save(amendment);

        return "Contact details amendment submitted successfully and is pending agent review.";
    }
}
