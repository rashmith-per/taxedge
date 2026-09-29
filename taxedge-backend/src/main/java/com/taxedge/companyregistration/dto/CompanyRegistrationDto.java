package com.taxedge.companyregistration.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public final class CompanyRegistrationDto {
    private CompanyRegistrationDto() {}

    public record CreateRequest(String companyType) {}
    public record DraftRequest(
            String id,
            DraftCompanyRequest company,
            List<DraftPersonRequest> directors,
            DraftNomineeRequest opcNominee,
            List<DraftPersonRequest> partners,
            List<DraftDocumentRequest> documents,
            LinkedRegistrationsRequest linkedRegistrations,
            FeeBreakdownRequest feeBreakdown,
            List<TrackingStageRequest> trackingStages,
            DraftReceiptRequest receipt,
            Integer currentStep,
            BigDecimal totalFee,
            String paymentStatus,
            String status,
            String createdAt) {}

    public record DraftCompanyRequest(
            String companyType, String industryCategory, String businessActivityDescription,
            String companyClass, String companyCategory, String companySubCategory,
            String primaryActivity, String nicCode, String secondaryActivity,
            String proposedName1, String proposedName2, String proposedName3,
            String nameSuffix, String nameAvailabilityStatus,
            String registeredAddressLine, String registeredCity, String registeredDistrict,
            String registeredState, String registeredPincode, String premisesOwnership,
            String companyEmail, String companyMobile,
            String officeAddressProofName, String officeAddressProofUri,
            String ownershipDocName, String ownershipDocUri,
            String ownerNocName, String ownerNocUri,
            BigDecimal authorizedCapital, BigDecimal paidUpCapital,
            Long numberOfShares, BigDecimal faceValuePerShare) {}

    public record DraftPersonRequest(
            String id, String personType, String name, String pan, String aadhaar, LocalDate dob,
            String fatherName, String gender, String nationality, String placeOfBirth,
            String occupation, String educationalQualification, String designation, String category,
            String email, String phone, Boolean hasDin, String din, Boolean hasDsc,
            BigDecimal sharesPercentage, String residentialAddress, Boolean isResidentInIndia,
            String addressLine1, String addressLine2, String city, String district, String state,
            String pinCode, Boolean sameAsPermanentAddress, String presentAddressLine1,
            String presentAddressLine2, String presentCity, String presentDistrict,
            String presentState, String presentPincode, Long numberOfShares,
            BigDecimal amountSubscribed, BigDecimal contributionAmount,
            BigDecimal profitSharePercentage, BigDecimal capitalContribution,
            BigDecimal profitSharingRatio, String relationship,
            String identityProofDocName, String residentialAddressProofDocName) {}

    public record DraftNomineeRequest(String name, String pan, String aadhaar, String email, String phone, String relationship) {}
        public record DraftDocumentRequest(String id, String name, String category, boolean required, String status, String fileUri, String fileName, String custId) {}
    public record FeeBreakdownRequest(BigDecimal professionalFee, BigDecimal gstAmount, BigDecimal statutoryCharges, BigDecimal totalAmount) {}
    public record TrackingStageRequest(String id, String title, String description, String status, String updatedAt) {}
    public record DraftReceiptRequest(String applicationId, String companyName, String companyType, String appliedDate, BigDecimal totalAmount, String paymentStatus, String paymentMethod, String transactionId) {}

    public record DetailsRequest(
            String industryCategory, String businessActivityDescription,
            String companyClass, String companyCategory, String companySubCategory,
            String primaryActivity, String nicCode, String secondaryActivity,
            String proposedName1, String proposedName2, String proposedName3,
            String nameSuffix, String nameAvailabilityStatus,
            String companyEmail, String companyMobile) {}
    public record OfficeRequest(String addressLine, String city, String district, String state, String pincode, String premisesOwnership) {}
    public record PersonRequest(
            String id, String personType, String name, String pan, String aadhaar, LocalDate dob,
            String fatherName, String gender, String nationality, String placeOfBirth,
            String occupation, String educationalQualification, String designation, String category,
            String email, String phone, Boolean hasDin, String din, Boolean hasDsc,
            BigDecimal sharesPercentage, String residentialAddress, Boolean isResidentInIndia,
            String addressLine1, String addressLine2, String city, String district, String state,
            String pinCode, Boolean sameAsPermanentAddress, String presentAddressLine1,
            String presentAddressLine2, String presentCity, String presentDistrict,
            String presentState, String presentPincode, Long numberOfShares,
            BigDecimal amountSubscribed, BigDecimal contributionAmount,
            BigDecimal profitSharePercentage, BigDecimal capitalContribution,
            BigDecimal profitSharingRatio, String relationship,
            String identityProofDocName, String residentialAddressProofDocName) {}
    public record CapitalRequest(BigDecimal authorizedCapital, BigDecimal paidUpCapital, Long numberOfShares, BigDecimal faceValuePerShare) {}
    public record ShareholdingRequest(String person, Long numberOfShares, BigDecimal shareValue, BigDecimal percentage) {}
    public record LinkedRegistrationsRequest(boolean pan, boolean tan, boolean gst, boolean esic, boolean epfo, boolean professionalTax, boolean bankAccount) {}
    public record PaymentRequest(BigDecimal amount, BigDecimal governmentFee, BigDecimal professionalFee, BigDecimal totalAmount, String paymentStatus, String transactionId, String paymentGateway, String paymentMethod) {}
    public record ApplicationSummary(Long id, String applicationNumber, String companyType, String status, Integer currentStep, LocalDateTime createdAt, LocalDateTime updatedAt) {}
    public record SubmissionResponse(Long applicationId, String applicationNumber, String status, LocalDateTime submittedAt) {}
        public record DocumentResponse(Long id, String custId, String documentType, String name, String category, boolean required, String fileName, String fileUri, Long fileSize, String mimeType, String status, LocalDateTime uploadedAt, LocalDateTime verifiedAt, String remarks) {}
    public record ApplicationResponse(
            ApplicationSummary application, Map<String, Object> companyDetails,
            Map<String, Object> registeredOffice, List<Map<String, Object>> persons,
            Map<String, Object> capital, List<Map<String, Object>> shareholdings,
            List<DocumentResponse> documents, Map<String, Object> linkedRegistrations,
            List<Map<String, Object>> payments, List<Map<String, Object>> tracking) {}
}
