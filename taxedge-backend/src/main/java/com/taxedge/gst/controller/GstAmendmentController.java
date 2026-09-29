package com.taxedge.gst.controller;

import com.taxedge.gst.dto.*;
import com.taxedge.gst.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/gst/amendments")
@RequiredArgsConstructor
public class GstAmendmentController {

    private final AdditionalPlaceAmendmentService additionalPlaceService;
    private final BankAccountAmendmentService bankAccountService;
    private final ContactAmendmentService contactService;
    private final LegalNameAmendmentService legalNameService;
    private final PrincipalPlaceAmendmentService principalPlaceService;
    private final SignatoryAmendmentService signatoryService;

   

    @GetMapping("/additional-place/{gstId}/existing")
    public ResponseEntity<List<AdditionalPlaceAmendmentViewDto>> getExistingAdditionalPlaces(@PathVariable String gstId) {
        return ResponseEntity.ok(additionalPlaceService.getExistingAdditionalPlaces(gstId));
    }

    @PostMapping("/additional-place/{gstId}")
    public ResponseEntity<String> submitNewAdditionalPlace(
            @PathVariable String gstId,
            @ModelAttribute AdditionalPlaceAmendmentViewDto dto,
            @RequestParam("file") MultipartFile file) throws IOException {
        String result = additionalPlaceService.submitAdditionalPlace(
                gstId, dto.getAddress(), dto.getCity(), dto.getPinCode(), dto.getNatureOfPremises(), file);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    
    @GetMapping("/bank-account/{gstId}/existing")
    public ResponseEntity<BankAccountAmendmentViewDto> getExistingBankAccountDetails(@PathVariable String gstId) {
        return ResponseEntity.ok(bankAccountService.getExistingBankAccountDetails(gstId));
    }

    @PostMapping("/bank-account/{gstId}")
    public ResponseEntity<String> submitBankAccountAmendment(
            @PathVariable String gstId,
            @ModelAttribute BankAccountAmendmentViewDto dto,
            @RequestParam("file") MultipartFile file) throws IOException {
        String result = bankAccountService.submitBankAccountAmendment(
                gstId, dto.getNewBankName(), dto.getNewBankAccountNumber(),
                dto.getNewIfscCode(), dto.getNewAccountType(), file);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    

    @GetMapping("/contact/{gstId}/existing")
    public ResponseEntity<ContactAmendmentViewDto> getExistingContact(@PathVariable String gstId) {
        return ResponseEntity.ok(contactService.getExistingContactDetails(gstId));
    }

    @PostMapping("/contact/{gstId}")
    public ResponseEntity<String> submitContactAmendment(
            @PathVariable String gstId,
            @ModelAttribute ContactAmendmentViewDto dto,
            @RequestParam("file") MultipartFile file) throws IOException {
        String response = contactService.submitContactAmendment(
                gstId, dto.getNewMobileNumber(), dto.getNewEmail(), file);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    

    @GetMapping("/legal-name/{gstId}/existing")
    public ResponseEntity<LegalNameAmendmentViewDto> getExistingLegalNameDetails(@PathVariable String gstId) {
        return ResponseEntity.ok(legalNameService.getExistingLegalNameDetails(gstId));
    }

    @PostMapping("/legal-name/{gstId}")
    public ResponseEntity<String> submitLegalNameAmendment(
            @PathVariable String gstId,
            @ModelAttribute LegalNameAmendmentViewDto dto,
            @RequestParam("file") MultipartFile file) throws IOException {
        String result = legalNameService.submitLegalNameAmendment(gstId, dto.getNewLegalName(), file);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

   

    @GetMapping("/principal-place/{gstId}/existing")
    public ResponseEntity<PrincipalPlaceAmendmentViewDto> getExistingPrincipalPlaceDetails(@PathVariable String gstId) {
        return ResponseEntity.ok(principalPlaceService.getExistingPrincipalPlaceDetails(gstId));
    }

    @PostMapping("/principal-place/{gstId}")
    public ResponseEntity<String> submitNewPrincipalPlaceAmendment(
            @PathVariable String gstId,
            @ModelAttribute PrincipalPlaceAmendmentViewDto dto,
            @RequestParam("file") MultipartFile file) throws IOException {
        String result = principalPlaceService.submitAmendment(
                gstId, dto.getNewBusinessAddress(), dto.getNewCity(), dto.getNewDistrict(),
                dto.getNewState(), dto.getNewPinCode(), dto.getNatureOfPremises(), file);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    

    @GetMapping("/signatory/{gstId}/existing")
    public ResponseEntity<SignatoryAmendmentViewDto> getExistingSignatoryDetails(@PathVariable String gstId) {
        return ResponseEntity.ok(signatoryService.getExistingSignatoryDetails(gstId));
    }

    @PostMapping("/signatory/{gstId}")
    public ResponseEntity<String> submitSignatoryAmendment(
            @PathVariable String gstId,
            @ModelAttribute SignatoryAmendmentViewDto dto,
            @RequestParam("file") MultipartFile file) throws IOException {
        String result = signatoryService.submitSignatoryAmendment(
                gstId, dto.getNewSignatoryName(), dto.getNewSignatoryPan(), dto.getNewSignatoryDob(),
                dto.getNewDesignation(), dto.getNewSignatoryMobile(), dto.getNewSignatoryEmail(), file);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }
}
