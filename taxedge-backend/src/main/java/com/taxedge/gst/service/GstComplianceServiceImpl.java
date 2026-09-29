package com.taxedge.gst.service;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.taxedge.gst.dto.GstComplianceDto;
import com.taxedge.gst.entity.GstCompliance;
import com.taxedge.gst.enums.ComplianceRequestType;
import com.taxedge.gst.exception.ResourceNotFoundException;
import com.taxedge.gst.helper.RandomNumberGenerator;
import com.taxedge.gst.repository.GstComplianceRepository;
import com.taxedge.gst.service.GstComplianceService;

@Service
@RequiredArgsConstructor
public class GstComplianceServiceImpl implements GstComplianceService {

    private final GstComplianceRepository complianceRepository;
    private final ModelMapper modelMapper;

    @Override
    public String createCompliance(
            GstComplianceDto dto,
            MultipartFile reconciliationFile1,
            MultipartFile reconciliationFile2,
            MultipartFile noticeFile) throws IOException {

        if (dto.getGstin() == null ||
                dto.getGstin().isBlank()) {

            throw new IllegalArgumentException(
                    "GSTIN is required");
        }

        if (dto.getFinancialYear() == null ||
                dto.getFinancialYear().isBlank()) {

            throw new IllegalArgumentException(
                    "Financial year is required");
        }

        if (dto.getRequestType() == null) {

            throw new IllegalArgumentException(
                    "Request type is required");
        }

        GstCompliance compliance =
                modelMapper.map(dto, GstCompliance.class);

        compliance.setId(
                RandomNumberGenerator.generateComplianceId());

        if (dto.getRequestType() ==
                ComplianceRequestType.RECONCILIATION_SUPPORT) {

            if (dto.getGstr2bNumber() == null ||
                    dto.getGstr2bNumber().isBlank()) {

                throw new IllegalArgumentException(
                        "GSTR-2B number is required");
            }

            if (reconciliationFile1 == null ||
                    reconciliationFile1.isEmpty()) {

                throw new IllegalArgumentException(
                        "Reconciliation document 1 is required");
            }

            if (reconciliationFile2 == null ||
                    reconciliationFile2.isEmpty()) {

                throw new IllegalArgumentException(
                        "Reconciliation document 2 is required");
            }

            compliance.setReconciliationFile1(
                    convertToBase64(reconciliationFile1));

            compliance.setReconciliationFile2(
                    convertToBase64(reconciliationFile2));
        }

        if (dto.getRequestType() ==
                ComplianceRequestType.NOTICE_RESPONSE) {

            if (dto.getNoticeNumber() == null ||
                    dto.getNoticeNumber().isBlank()) {

                throw new IllegalArgumentException(
                        "Notice number is required");
            }

            if (dto.getNoticeIssueDate() == null) {

                throw new IllegalArgumentException(
                        "Notice issue date is required");
            }

            if (dto.getReplyDueDate() == null) {

                throw new IllegalArgumentException(
                        "Reply due date is required");
            }

            if (noticeFile == null ||
                    noticeFile.isEmpty()) {

                throw new IllegalArgumentException(
                        "Notice document is required");
            }

            compliance.setNoticeFile(
                    convertToBase64(noticeFile));
        }

        complianceRepository.save(compliance);

        return "GST compliance request created successfully with ID: "
                + compliance.getId();
    }

    @Override
    public List<GstComplianceDto> getComplianceByGstin(
            String gstin) {

        List<GstCompliance> complianceList =
                complianceRepository.findByGstin(gstin);

        return complianceList.stream()
                .map(compliance ->
                        modelMapper.map(
                                compliance,
                                GstComplianceDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public String updateCompliance(
            String gstin,
            String id,
            GstComplianceDto dto,
            MultipartFile reconciliationFile1,
            MultipartFile reconciliationFile2,
            MultipartFile noticeFile) throws IOException {

        GstCompliance compliance =
                complianceRepository
                        .findByIdAndGstin(id, gstin)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Compliance request not found"));

        modelMapper.typeMap(
                GstComplianceDto.class,
                GstCompliance.class)
                .addMappings(mapper -> {
                    mapper.skip(GstCompliance::setId);
                });

        modelMapper.map(dto, compliance);

        if (dto.getRequestType() ==
                ComplianceRequestType.RECONCILIATION_SUPPORT) {

            if (dto.getGstr2bNumber() == null ||
                    dto.getGstr2bNumber().isBlank()) {

                throw new IllegalArgumentException(
                        "GSTR-2B number is required");
            }

            if (reconciliationFile1 != null &&
                    !reconciliationFile1.isEmpty()) {

                compliance.setReconciliationFile1(
                        convertToBase64(reconciliationFile1));
            }

            if (reconciliationFile2 != null &&
                    !reconciliationFile2.isEmpty()) {

                compliance.setReconciliationFile2(
                        convertToBase64(reconciliationFile2));
            }

            compliance.setNoticeNumber(null);
            compliance.setNoticeIssueDate(null);
            compliance.setReplyDueDate(null);
            compliance.setNoticeFile(null);
        }

        if (dto.getRequestType() ==
                ComplianceRequestType.NOTICE_RESPONSE) {

            if (dto.getNoticeNumber() == null ||
                    dto.getNoticeNumber().isBlank()) {

                throw new IllegalArgumentException(
                        "Notice number is required");
            }

            if (dto.getNoticeIssueDate() == null) {

                throw new IllegalArgumentException(
                        "Notice issue date is required");
            }

            if (dto.getReplyDueDate() == null) {

                throw new IllegalArgumentException(
                        "Reply due date is required");
            }

            if (noticeFile != null &&
                    !noticeFile.isEmpty()) {

                compliance.setNoticeFile(
                        convertToBase64(noticeFile));
            }

            compliance.setGstr2bNumber(null);
            compliance.setReconciliationFile1(null);
            compliance.setReconciliationFile2(null);
        }

        complianceRepository.save(compliance);

        return "GST compliance request updated successfully";
    }

    @Override
    public String deleteCompliance(
            String gstin,
            String id) {

        GstCompliance compliance =
                complianceRepository
                        .findByIdAndGstin(id, gstin)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Compliance request not found"));

        complianceRepository.delete(compliance);

        return "GST compliance request deleted successfully";
    }

    private String convertToBase64(
            MultipartFile file) throws IOException {

        byte[] fileBytes = file.getBytes();

        return Base64.getEncoder()
                .encodeToString(fileBytes);
    }
}