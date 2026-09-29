package com.taxedge.gst.service;

import com.taxedge.gst.dto.PrincipalPlaceAmendmentViewDto;
import com.taxedge.gst.entity.Business;
import com.taxedge.gst.entity.PrincipalPlaceAmendmentEntity;
import com.taxedge.gst.enums.NatureOfPremises;
import com.taxedge.gst.exception.ResourceNotFoundException;
import com.taxedge.gst.repository.BusinessRepository;
import com.taxedge.gst.repository.PrincipalPlaceAmendmentRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class PrincipalPlaceAmendmentServiceImpl implements PrincipalPlaceAmendmentService {

    private final BusinessRepository businessRepository;
    private final PrincipalPlaceAmendmentRepository amendmentRepository;

    private Business resolveBusiness(String gstId) {
        return businessRepository.findById(gstId)
                .orElseGet(() -> businessRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("No registered business found in the system.")));
    }

    @Override
    public PrincipalPlaceAmendmentViewDto getExistingPrincipalPlaceDetails(String gstId) {
        Business business = resolveBusiness(gstId);

        return PrincipalPlaceAmendmentViewDto.builder()
                .newBusinessAddress(business.getBusinessAddress())
                .newCity(business.getCity())
                .newDistrict(business.getDistrict())
                .newState(business.getState())
                .newPinCode(business.getPinCode())
                .build();
    }

    @Override
    @Transactional
    public String submitAmendment(String gstId, String address, String city, String district,
                                  String state, String pinCode, NatureOfPremises natureOfPremises,
                                  MultipartFile file) throws IOException {

        Business business = resolveBusiness(gstId);

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Supporting proof document is required for principal place amendment");
        }

        String base64Data = Base64.getEncoder().encodeToString(file.getBytes());

        PrincipalPlaceAmendmentEntity amendment = PrincipalPlaceAmendmentEntity.builder()
                .business(business)
                .newBusinessAddress(address)
                .newCity(city)
                .newDistrict(district)
                .newState(state)
                .newPinCode(pinCode)
                .natureOfPremises(natureOfPremises)
                .imageData(base64Data)
                .build();

        amendmentRepository.save(amendment);

        return "Principal place of business amendment submitted successfully and is pending agent review.";
    }
}
