package com.taxedge.gst.service;

import java.io.IOException;
import java.util.Base64;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.taxedge.gst.dto.DocumentsDto;
import com.taxedge.gst.entity.Documents;
import com.taxedge.gst.enums.AddressProofType;
import com.taxedge.gst.enums.DocumentType;
import com.taxedge.gst.exception.ResourceNotFoundException;
import com.taxedge.gst.repository.BusinessRepository;
import com.taxedge.gst.repository.DocumentsRepository;

@Service
@RequiredArgsConstructor
public class DocumentsServiceImpl implements DocumentsService {

    private final DocumentsRepository documentsRepository;
    private final BusinessRepository businessRepository;
    private final ModelMapper modelMapper;
    
    @Override
    public String uploadFile(
            String gstId,
            String documentType,
            String addressProofType,
            MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please select a file");
        }

        businessRepository.findById(gstId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Business not found with gstId: " + gstId));

        long documentCount = documentsRepository.countByGstId(gstId);

        if (documentCount >= 6) {
            throw new IllegalArgumentException(
                    "Maximum 6 documents allowed for one GST ID");
        }

        DocumentType type = DocumentType.valueOf(documentType);

        boolean alreadyExists =
                documentsRepository.existsByGstIdAndDocumentType(gstId,type);

        if (alreadyExists) {
            throw new IllegalArgumentException(
                    type + " document already uploaded for this GST ID");
        }

        AddressProofType proofType = null;

        if (type == DocumentType.PRINCIPAL_PLACE_ADDRESS_PROOF) {

            if (addressProofType == null || addressProofType.trim().isEmpty()) {
                throw new IllegalArgumentException(
                        "Address proof type is required for principal place address proof");
            }

            proofType = AddressProofType.valueOf(addressProofType);

        } else {

            if (addressProofType != null && !addressProofType.trim().isEmpty()) {
                throw new IllegalArgumentException(
                        "Address proof type is allowed only for principal place address proof");
            }
        }

        byte[] fileBytes = file.getBytes();

        String base64Data =
                Base64.getEncoder().encodeToString(fileBytes);

        Documents document = new Documents();

        document.setGstId(gstId);
        document.setDocumentType(type);
        document.setAddressProofType(proofType);
        document.setFileName(file.getOriginalFilename());
        document.setFileType(file.getContentType());
        document.setImageData(base64Data);

        documentsRepository.save(document);

        return "Document uploaded successfully";
    }

    @Override
    public String updateFile(
            String gstId,
            Long id,
            String addressProofType,
            MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please select a file");
        }

        businessRepository.findById(gstId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Business not found with gstId: " + gstId));

        Documents document = documentsRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Document not found with id: " + id));

        if (!document.getGstId().equals(gstId)) {
            throw new ResourceNotFoundException(
                    "Document does not belong to gstId: " + gstId);
        }

        DocumentType type = document.getDocumentType();

        AddressProofType proofType = null;

        if (type == DocumentType.PRINCIPAL_PLACE_ADDRESS_PROOF) {

            if (addressProofType == null || addressProofType.trim().isEmpty()) {
                throw new IllegalArgumentException(
                        "Address proof type is required for principal place address proof");
            }

            proofType = AddressProofType.valueOf(addressProofType);

        } else {

            if (addressProofType != null && !addressProofType.trim().isEmpty()) {
                throw new IllegalArgumentException(
                        "Address proof type is allowed only for principal place address proof");
            }
        }

        byte[] fileBytes = file.getBytes();

        String base64Data =
                Base64.getEncoder().encodeToString(fileBytes);

        document.setAddressProofType(proofType);
        document.setFileName(file.getOriginalFilename());
        document.setFileType(file.getContentType());
        document.setImageData(base64Data);

        documentsRepository.save(document);

        return "Document updated successfully";
    }

    @Override
    public String deleteFile(String gstId,Long id) {

        businessRepository.findById(gstId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Business not found with gstId: " + gstId));

        Documents document = documentsRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Document not found with id: " + id));

        if (!document.getGstId().equals(gstId)) {
            throw new ResourceNotFoundException(
                    "Document does not belong to gstId: " + gstId);
        }

        documentsRepository.delete(document);

        return "Document deleted successfully";
    }

//    @Override
//    public List<DocumentsDto> getDocumentsByGstId(String gstId) {
//
//        businessRepository.findById(gstId)
//                .orElseThrow(() ->
//                        new ResourceNotFoundException(
//                                "Business not found with gstId: " + gstId));
//
//        return documentsRepository.findByGstId(gstId);
//    }
    
    @Override
    public List<DocumentsDto> getDocumentsByGstId(String gstId) {

        businessRepository.findById(gstId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Business not found with gstId: " + gstId));

        List<Documents> documents =
                documentsRepository.findByGstId(gstId);

        return documents.stream()
                .map(document -> modelMapper.map(document, DocumentsDto.class))
                .toList();
    }
}