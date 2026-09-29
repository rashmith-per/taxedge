package com.taxedge.gst.service;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.taxedge.gst.dto.AdditionalPlaceAmendmentViewDto;
import com.taxedge.gst.entity.AdditionalPlaceAmendmentEntity;
import com.taxedge.gst.entity.Business;
import com.taxedge.gst.enums.NatureOfPremises;
import com.taxedge.gst.exception.ResourceNotFoundException;
import com.taxedge.gst.repository.AdditionalPlaceAmendmentRepository;
import com.taxedge.gst.repository.BusinessRepository;

@Service
@RequiredArgsConstructor
public class AdditionalPlaceAmendmentServiceImpl implements AdditionalPlaceAmendmentService {

    private final BusinessRepository businessRepository;
    private final AdditionalPlaceAmendmentRepository additionalPlaceRepository;

    private Business resolveBusiness(String gstId) {
        return businessRepository.findById(gstId)
                .orElseGet(() -> businessRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("No registered business found in the system.")));
    }

    @Override
    public List<AdditionalPlaceAmendmentViewDto> getExistingAdditionalPlaces(String gstId) {
        Business business = resolveBusiness(gstId);

        List<AdditionalPlaceAmendmentEntity> entities = additionalPlaceRepository.findByBusinessGstId(business.getGstId());

        return entities.stream().map(entity -> AdditionalPlaceAmendmentViewDto.builder()
                .address(entity.getAddress())
                .city(entity.getCity())
                .pinCode(entity.getPinCode())
                .natureOfPremises(entity.getNatureOfPremises())
                .imageData(entity.getImageData())
                .build()).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public String submitAdditionalPlace(String gstId, String address, String city, String pinCode,
                                        NatureOfPremises natureOfPremises, MultipartFile file) throws IOException {

        Business business = resolveBusiness(gstId);

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Supporting proof document is required for an additional place of business");
        }

        String base64Data = Base64.getEncoder().encodeToString(file.getBytes());

        AdditionalPlaceAmendmentEntity entity = AdditionalPlaceAmendmentEntity.builder()
                .business(business)
                .address(address)
                .city(city)
                .pinCode(pinCode)
                .natureOfPremises(natureOfPremises)
                .imageData(base64Data)
                .build();

        additionalPlaceRepository.save(entity);

        return "Additional place of business submitted successfully and is pending agent review.";
    }
}
