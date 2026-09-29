package com.taxedge.gst.controller;

import java.io.IOException;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taxedge.gst.dto.GstCancellationDto;
import com.taxedge.gst.entity.GstCancellation;
import com.taxedge.gst.service.GstCancellationService;

@RestController
@RequestMapping("/api/v1/gst/cancellation")
@RequiredArgsConstructor
public class GstCancellationController {

    private final ObjectMapper objectMapper;
    private final GstCancellationService cancellationService;

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> createCancellation(

            @RequestPart("data") String data,

            @RequestPart(value = "supportingProofDocument", required = false)
            MultipartFile supportingProofDocument) throws IOException {

        GstCancellationDto dto =
                objectMapper.readValue(data, GstCancellationDto.class);

        dto.setSupportingProofDocument(supportingProofDocument);

        String result =
                cancellationService.createCancellation(dto);

        return new ResponseEntity<>(
                result,
                HttpStatus.CREATED);
    }

    @GetMapping("/{gstin}")
    public ResponseEntity<GstCancellation> getCancellation(
            @PathVariable String gstin) {

        GstCancellation cancellation =
                cancellationService.getCancellation(gstin);

        return ResponseEntity.ok(cancellation);
    }
}