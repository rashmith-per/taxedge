package com.taxedge.gst.controller;

import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taxedge.gst.dto.GstComplianceDto;
import com.taxedge.gst.service.GstComplianceService;

@RestController
@RequestMapping("/api/v1/gst/compliance")
@RequiredArgsConstructor
public class GstComplianceController {

    private final ObjectMapper objectMapper;
    private final GstComplianceService complianceService;

    @PostMapping(
            value = "/create",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> createCompliance(

            @RequestPart("data") String data,

            @RequestPart(value = "reconciliationFile1", required = false)
            MultipartFile reconciliationFile1,

            @RequestPart(value = "reconciliationFile2", required = false)
            MultipartFile reconciliationFile2,

            @RequestPart(value = "noticeFile", required = false)
            MultipartFile noticeFile) throws IOException {

        GstComplianceDto dto =
                objectMapper.readValue(data, GstComplianceDto.class);

        String result = complianceService.createCompliance(
                dto,
                reconciliationFile1,
                reconciliationFile2,
                noticeFile);

        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @GetMapping("/{gstin}")
    public ResponseEntity<List<GstComplianceDto>> getComplianceByGstin(
            @PathVariable String gstin) {

        List<GstComplianceDto> compliance =
                complianceService.getComplianceByGstin(gstin);

        return ResponseEntity.ok(compliance);
    }

    @PutMapping(
            value = "/{gstin}/{id}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> updateCompliance(

            @PathVariable String gstin,

            @PathVariable String id,

            @RequestPart("data") String data,

            @RequestPart(value = "reconciliationFile1", required = false)
            MultipartFile reconciliationFile1,

            @RequestPart(value = "reconciliationFile2", required = false)
            MultipartFile reconciliationFile2,

            @RequestPart(value = "noticeFile", required = false)
            MultipartFile noticeFile) throws IOException {

        GstComplianceDto dto =
                objectMapper.readValue(data, GstComplianceDto.class);

        String result = complianceService.updateCompliance(
                gstin,
                id,
                dto,
                reconciliationFile1,
                reconciliationFile2,
                noticeFile);

        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{gstin}/{id}")
    public ResponseEntity<String> deleteCompliance(
            @PathVariable String gstin,
            @PathVariable String id) {

        String result =
                complianceService.deleteCompliance(gstin, id);

        return ResponseEntity.ok(result);
    }
}