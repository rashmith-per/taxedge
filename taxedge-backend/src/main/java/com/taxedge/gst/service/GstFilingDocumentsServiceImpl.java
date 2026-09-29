package com.taxedge.gst.service;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.taxedge.gst.dto.GstFilingDocumentsDto;
import com.taxedge.gst.entity.GstFilingDocuments;
import com.taxedge.gst.enums.GstFilingDocumentType;
import com.taxedge.gst.exception.ResourceNotFoundException;
import com.taxedge.gst.repository.GstFilingDocumentsRepository;
import com.taxedge.gst.repository.GstFilingRepository;

@Service
@RequiredArgsConstructor
public class GstFilingDocumentsServiceImpl
        implements GstFilingDocumentsService {

    private final GstFilingDocumentsRepository documentsRepository;
    private final GstFilingRepository filingRepository;
    private final ModelMapper modelMapper;

    @Override
    public String uploadDocument(
            String filingId,
            String documentType,
            MultipartFile file)
            throws IOException {

        filingRepository.findById(filingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "GST filing not found with id: "
                                        + filingId));

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "File is required");
        }

        GstFilingDocumentType type;

        try {
            type = GstFilingDocumentType.valueOf(
                    documentType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Invalid document type: "
                            + documentType);
        }

        boolean alreadyExists =
                documentsRepository
                        .existsByFilingIdAndDocumentType(
                                filingId,
                                type);

        if (alreadyExists) {
            throw new IllegalArgumentException(
                    "Document already uploaded for: "
                            + type);
        }

        GstFilingDocuments document =
                new GstFilingDocuments();

        document.setFilingId(filingId);

        document.setDocumentType(type);

        document.setFileName(file.getOriginalFilename());

        document.setFileType(file.getContentType());

        String base64Data =
                Base64.getEncoder()
                        .encodeToString(file.getBytes());

        document.setFileData(base64Data);

        documentsRepository.save(document);

        return "GST filing document uploaded successfully";
    }

    @Override
    public List<GstFilingDocumentsDto> getDocuments(
            String filingId) {

        filingRepository.findById(filingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "GST filing not found with id: "
                                        + filingId));

        List<GstFilingDocuments> documents =
                documentsRepository.findByFilingId(
                        filingId);

        return documents.stream()
                .map(document ->
                        modelMapper.map(
                                document,
                                GstFilingDocumentsDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public String updateDocument(
            String filingId,
            Long id,
            MultipartFile file)
            throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "File is required");
        }

        GstFilingDocuments document =
                documentsRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Document not found with id: "
                                                + id));

        if (!document.getFilingId()
                .equals(filingId)) {

            throw new ResourceNotFoundException(
                    "Document does not belong to filingId: " + filingId);
        }

        document.setFileName(file.getOriginalFilename());

        document.setFileType(file.getContentType());

        String base64Data =
                Base64.getEncoder()
                        .encodeToString(file.getBytes());

        document.setFileData(base64Data);

        documentsRepository.save(document);

        return "GST filing document updated successfully";
    }

    @Override
    public String deleteDocument(
            String filingId,
            Long id) {

        GstFilingDocuments document =
                documentsRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Document not found with id: "
                                                + id));

        if (!document.getFilingId()
                .equals(filingId)) {

            throw new ResourceNotFoundException(
                    "Document does not belong to filingId: "
                            + filingId);
        }

        documentsRepository.delete(document);

        return "GST filing document deleted successfully";
    }
}