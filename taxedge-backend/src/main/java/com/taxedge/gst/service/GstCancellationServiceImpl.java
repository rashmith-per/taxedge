package com.taxedge.gst.service;

import java.io.IOException;
import java.util.Base64;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.taxedge.gst.dto.GstCancellationDto;
import com.taxedge.gst.entity.GstCancellation;
import com.taxedge.gst.exception.ResourceNotFoundException;
import com.taxedge.gst.repository.GstCancellationRepository;

@Service
@RequiredArgsConstructor
public class GstCancellationServiceImpl
        implements GstCancellationService {

    private final GstCancellationRepository cancellationRepository;
    private final ModelMapper modelMapper;

    @Override
    public String createCancellation(
            GstCancellationDto gstCancellationDto)
            throws IOException {

        if (cancellationRepository.existsById(
                gstCancellationDto.getGstin())) {

            throw new IllegalArgumentException(
                    "GST cancellation already exists for GSTIN: "
                            + gstCancellationDto.getGstin());
        }

        GstCancellation cancellation =
                modelMapper.map(
                        gstCancellationDto,
                        GstCancellation.class);

        if (gstCancellationDto.getSupportingProofDocument() != null
                && !gstCancellationDto
                        .getSupportingProofDocument()
                        .isEmpty()) {

            String base64Data =
                    Base64.getEncoder()
                            .encodeToString(
                                    gstCancellationDto
                                            .getSupportingProofDocument()
                                            .getBytes());

            cancellation.setSupportingProofDocument(
                    base64Data);
        }

        cancellationRepository.save(cancellation);

        return "GST cancellation details saved successfully";
    }

    @Override
    public GstCancellation getCancellation(
            String gstin) {

        return cancellationRepository.findById(gstin)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "GST cancellation details not found for GSTIN: "
                                        + gstin));
    }
}