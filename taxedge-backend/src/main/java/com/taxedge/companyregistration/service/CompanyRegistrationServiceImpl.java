package com.taxedge.companyregistration.service;

import com.taxedge.companyregistration.dto.CompanyRegistrationDto;
import com.taxedge.companyregistration.dto.request.CapitalRequest;
import com.taxedge.companyregistration.dto.request.CompanyDetailsRequest;
import com.taxedge.companyregistration.dto.request.CreateCompanyRegistrationRequest;
import com.taxedge.companyregistration.dto.request.LinkedRegistrationRequest;
import com.taxedge.companyregistration.dto.request.PaymentRequest;
import com.taxedge.companyregistration.dto.request.PersonRequest;
import com.taxedge.companyregistration.dto.request.RegisteredOfficeRequest;
import com.taxedge.companyregistration.dto.request.ShareholdingRequest;
import com.taxedge.companyregistration.dto.response.CompanyRegistrationResponse;
import com.taxedge.companyregistration.dto.response.DocumentResponse;
import com.taxedge.companyregistration.dto.response.ReceiptResponse;
import com.taxedge.companyregistration.dto.response.ReviewResponse;
import com.taxedge.companyregistration.dto.response.SubmissionResponse;
import com.taxedge.companyregistration.dto.response.TrackingResponse;
import com.taxedge.companyregistration.entity.*;
import com.taxedge.companyregistration.exception.CompanyRegistrationException;
import com.taxedge.companyregistration.exception.CompanyRegistrationNotFoundException;
import com.taxedge.companyregistration.exception.CompanyRegistrationValidationException;
import com.taxedge.companyregistration.repository.*;
import com.taxedge.security.jwt.JwtPrincipal;
import org.springframework.transaction.annotation.Transactional;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CompanyRegistrationServiceImpl implements CompanyRegistrationService {
    private final CompanyRegistrationRepository registrationRepository;
    private final CompanyDetailsRepository detailsRepository;
    private final CompanyRegisteredOfficeRepository officeRepository;
    private final CompanyPersonRepository personRepository;
    private final CompanyCapitalRepository capitalRepository;
    private final CompanyShareholdingRepository shareholdingRepository;
    private final CompanyRegistrationDocumentRepository documentRepository;
    private final CompanyLinkedRegistrationRepository linkedRepository;
    private final CompanyRegistrationPaymentRepository paymentRepository;
    private final CompanyRegistrationTrackingRepository trackingRepository;

    public CompanyRegistrationServiceImpl(
            CompanyRegistrationRepository registrationRepository,
            CompanyDetailsRepository detailsRepository,
            CompanyRegisteredOfficeRepository officeRepository,
            CompanyPersonRepository personRepository,
            CompanyCapitalRepository capitalRepository,
            CompanyShareholdingRepository shareholdingRepository,
            CompanyRegistrationDocumentRepository documentRepository,
            CompanyLinkedRegistrationRepository linkedRepository,
            CompanyRegistrationPaymentRepository paymentRepository,
            CompanyRegistrationTrackingRepository trackingRepository) {
        this.registrationRepository = registrationRepository;
        this.detailsRepository = detailsRepository;
        this.officeRepository = officeRepository;
        this.personRepository = personRepository;
        this.capitalRepository = capitalRepository;
        this.shareholdingRepository = shareholdingRepository;
        this.documentRepository = documentRepository;
        this.linkedRepository = linkedRepository;
        this.paymentRepository = paymentRepository;
        this.trackingRepository = trackingRepository;
    }

    @Override
    @Transactional
    public SubmissionResponse applyDraft(CompanyRegistrationDto.DraftRequest request) {
        validateDraft(request);
        CompanyRegistrationDto.DraftCompanyRequest company = request.company();

        CompanyRegistration registration = new CompanyRegistration();
        registration.setUserId(currentUserId());
        registration.setCompanyType(company.companyType());
        registration.setStatus(toBackendStatus(request.status(), request.paymentStatus()));
        registration.setCurrentStep(request.currentStep() == null ? 0 : request.currentStep());
        registration.setApplicationNumber("PENDING");
        registration = registrationRepository.save(registration);
        registration.setApplicationNumber(String.format("CR%d%06d", Year.now().getValue(), registration.getId()));
        registrationRepository.save(registration);

        CompanyDetails details = new CompanyDetails();
        details.setRegistration(registration);
        details.setIndustryCategory(company.industryCategory());
        details.setBusinessActivityDescription(company.businessActivityDescription());
        details.setCompanyClass(company.companyClass());
        details.setCompanyCategory(company.companyCategory());
        details.setCompanySubCategory(company.companySubCategory());
        details.setPrimaryActivity(company.primaryActivity());
        details.setNicCode(company.nicCode());
        details.setSecondaryActivity(company.secondaryActivity());
        details.setProposedName1(company.proposedName1());
        details.setProposedName2(company.proposedName2());
        details.setProposedName3(company.proposedName3());
        details.setNameSuffix(company.nameSuffix());
        details.setNameAvailabilityStatus(company.nameAvailabilityStatus());
        details.setCompanyEmail(company.companyEmail());
        details.setCompanyMobile(company.companyMobile());
        details.setAuthorizedCapital(company.authorizedCapital());
        details.setPaidUpCapital(company.paidUpCapital());
        details.setNumberOfShares(company.numberOfShares());
        details.setFaceValuePerShare(company.faceValuePerShare());
        detailsRepository.save(details);

        CompanyRegisteredOffice office = new CompanyRegisteredOffice();
        office.setRegistration(registration);
        office.setAddressLine(company.registeredAddressLine());
        office.setCity(company.registeredCity());
        office.setDistrict(company.registeredDistrict());
        office.setState(company.registeredState());
        office.setPincode(company.registeredPincode());
        office.setPremisesOwnership(company.premisesOwnership());
        office.setOfficeAddressProofName(company.officeAddressProofName());
        office.setOfficeAddressProofUri(company.officeAddressProofUri());
        office.setOwnershipDocName(company.ownershipDocName());
        office.setOwnershipDocUri(company.ownershipDocUri());
        office.setOwnerNocName(company.ownerNocName());
        office.setOwnerNocUri(company.ownerNocUri());
        officeRepository.save(office);

        CompanyCapital capital = new CompanyCapital();
        capital.setRegistration(registration);
        capital.setAuthorizedCapital(company.authorizedCapital());
        capital.setPaidUpCapital(company.paidUpCapital());
        capital.setNumberOfShares(company.numberOfShares());
        capital.setFaceValuePerShare(company.faceValuePerShare());
        capitalRepository.save(capital);

        List<CompanyPerson> people = new ArrayList<>();
        for (CompanyRegistrationDto.DraftPersonRequest person : nullSafe(request.directors())) {
            people.add(saveDraftPerson(registration, person, "DIRECTOR"));
        }
        for (CompanyRegistrationDto.DraftPersonRequest partner : nullSafe(request.partners())) {
            people.add(saveDraftPerson(registration, partner, "PARTNER"));
        }
        if (request.opcNominee() != null) {
            CompanyRegistrationDto.DraftNomineeRequest nominee = request.opcNominee();
            CompanyPerson nomineePerson = new CompanyPerson();
            nomineePerson.setRegistration(registration);
            nomineePerson.setPersonType("NOMINEE");
            nomineePerson.setName(nominee.name());
            nomineePerson.setPan(nominee.pan());
            nomineePerson.setAadhaar(nominee.aadhaar());
            nomineePerson.setEmail(nominee.email());
            nomineePerson.setPhone(nominee.phone());
            nomineePerson.setRelationship(nominee.relationship());
            people.add(personRepository.save(nomineePerson));
        }

        for (int index = 0; index < people.size(); index++) {
            CompanyPerson person = people.get(index);
            CompanyShareholding shareholding = new CompanyShareholding();
            shareholding.setRegistration(registration);
            shareholding.setPerson(person.getName());
            shareholding.setNumberOfShares(person.getNumberOfShares());
            shareholding.setShareValue(person.getAmountSubscribed());
            shareholding.setPercentage(person.getSharesPercentage());
            shareholdingRepository.save(shareholding);
        }

        CompanyRegistrationDto.LinkedRegistrationsRequest linkedRequest = request.linkedRegistrations();
        if (linkedRequest != null) {
            CompanyLinkedRegistration linked = new CompanyLinkedRegistration();
            linked.setRegistration(registration);
            linked.setPan(linkedRequest.pan());
            linked.setTan(linkedRequest.tan());
            linked.setGst(linkedRequest.gst());
            linked.setEsic(linkedRequest.esic());
            linked.setEpfo(linkedRequest.epfo());
            linked.setProfessionalTax(linkedRequest.professionalTax());
            linked.setBankAccount(linkedRequest.bankAccount());
            linkedRepository.save(linked);
        }

        for (CompanyRegistrationDto.DraftDocumentRequest documentRequest : nullSafe(request.documents())) {
            if ("Uploaded".equalsIgnoreCase(documentRequest.status()) || "UPLOADED".equalsIgnoreCase(documentRequest.status())) {
                continue;
            }
            CompanyRegistrationDocument document = new CompanyRegistrationDocument();
            document.setRegistration(registration);
            document.setCustId(registration.getUserId());
            document.setDocumentType(parseDocumentType(documentRequest.id()));
            document.setName(documentRequest.name());
            document.setCategory(documentRequest.category());
            document.setRequired(documentRequest.required());
            document.setFileName(StringUtils.hasText(documentRequest.fileName()) ? documentRequest.fileName() : documentRequest.id());
            document.setFileUri(documentRequest.fileUri());
            document.setStatus(StringUtils.hasText(documentRequest.status()) ? documentRequest.status() : "PENDING");
            document.setUploadedAt(LocalDateTime.now());
            documentRepository.save(document);
        }

        if (request.feeBreakdown() != null) {
            CompanyRegistrationDto.FeeBreakdownRequest fee = request.feeBreakdown();
            CompanyRegistrationPayment payment = new CompanyRegistrationPayment();
            payment.setRegistration(registration);
            payment.setAmount(fee.totalAmount());
            payment.setProfessionalFee(fee.professionalFee());
            payment.setGovernmentFee(fee.statutoryCharges());
            payment.setTotalAmount(fee.totalAmount());
            payment.setPaymentStatus(StringUtils.hasText(request.paymentStatus()) ? request.paymentStatus() : "PENDING");
            if (request.receipt() != null) {
                payment.setTransactionId(request.receipt().transactionId());
                payment.setPaymentMethod(request.receipt().paymentMethod());
            }
            paymentRepository.save(payment);
        }

        for (CompanyRegistrationDto.TrackingStageRequest stageRequest : nullSafe(request.trackingStages())) {
            CompanyRegistrationTracking stage = new CompanyRegistrationTracking();
            stage.setRegistration(registration);
            stage.setStage(stageRequest.title());
            stage.setStatus(stageRequest.status());
            stage.setDescription(stageRequest.description());
            trackingRepository.save(stage);
        }

        LocalDateTime submittedAt = null;
        if ("SUBMITTED".equals(registration.getStatus())) {
            submittedAt = LocalDateTime.now();
            registration.setSubmittedAt(submittedAt);
            registrationRepository.save(registration);
        }
        return new SubmissionResponse(
                registration.getId(), registration.getApplicationNumber(), registration.getStatus(), submittedAt);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> checkName(String name) {
        requireText(name, "name is required");
        boolean alreadyUsed = detailsRepository.existsByProposedName1IgnoreCaseOrProposedName2IgnoreCase(name, name);
        return Map.of("available", !alreadyUsed, "similarNames", List.of());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> status(Long id) {
        CompanyRegistration registration = owned(id);
        return Map.of(
                "status", registration.getStatus(),
            "currentStage", String.valueOf(registration.getCurrentStep() == null ? 0 : registration.getCurrentStep()));
    }

    private void validateDraft(CompanyRegistrationDto.DraftRequest request) {
        if (request == null || request.company() == null) throw new CompanyRegistrationValidationException("company is required");
        CompanyRegistrationDto.DraftCompanyRequest company = request.company();
        requireText(company.companyType(), "companyType is required");
        requireText(company.primaryActivity(), "primaryActivity is required");
        requireText(company.nicCode(), "nicCode is required");
        requireText(company.proposedName1(), "proposedName1 is required");
        requireText(company.proposedName2(), "proposedName2 is required");
        requireText(company.registeredAddressLine(), "registeredAddressLine is required");
        requireText(company.registeredCity(), "registeredCity is required");
        requireText(company.registeredState(), "registeredState is required");
        requireText(company.registeredPincode(), "registeredPincode is required");
        requireText(company.companyEmail(), "companyEmail is required");
        requireText(company.companyMobile(), "companyMobile is required");
        if (company.authorizedCapital() == null || company.paidUpCapital() == null) {
            throw new CompanyRegistrationValidationException("authorizedCapital and paidUpCapital are required");
        }
        if (company.paidUpCapital().compareTo(company.authorizedCapital()) > 0) {
            throw new CompanyRegistrationValidationException("paidUpCapital cannot exceed authorizedCapital");
        }
        if (nullSafe(request.directors()).isEmpty() && nullSafe(request.partners()).isEmpty()) {
            throw new CompanyRegistrationValidationException("At least one director or partner is required");
        }
        if ("SUBMITTED".equals(toBackendStatus(request.status(), request.paymentStatus()))) {
            Set<String> uploaded = nullSafe(request.documents()).stream()
                    .filter(document -> "Uploaded".equalsIgnoreCase(document.status()) || "UPLOADED".equalsIgnoreCase(document.status()))
                    .map(CompanyRegistrationDto.DraftDocumentRequest::id)
                    .collect(Collectors.toSet());
            Set<String> required = Set.of("DIRECTOR_PAN", "DIRECTOR_ID_PROOF", "REGISTERED_OFFICE_PROOF", "OFFICE_UTILITY_BILL");
            if (!uploaded.containsAll(required)) throw new CompanyRegistrationValidationException("Mandatory documents are missing");
        }
    }

    private CompanyPerson saveDraftPerson(CompanyRegistration registration, CompanyRegistrationDto.DraftPersonRequest request, String defaultType) {
        requireText(request.name(), "person name is required");
        requireText(request.pan(), "person PAN is required");
        requireText(request.email(), "person email is required");
        CompanyPerson person = new CompanyPerson();
        person.setRegistration(registration);
        person.setPersonType(StringUtils.hasText(request.personType()) ? request.personType() : defaultType);
        person.setName(request.name()); person.setPan(request.pan()); person.setAadhaar(request.aadhaar()); person.setDob(request.dob());
        person.setFatherName(request.fatherName()); person.setGender(request.gender()); person.setNationality(request.nationality());
        person.setPlaceOfBirth(request.placeOfBirth()); person.setOccupation(request.occupation()); person.setEducationalQualification(request.educationalQualification());
        person.setDesignation(request.designation()); person.setCategory(request.category()); person.setEmail(request.email()); person.setPhone(request.phone());
        person.setHasDin(request.hasDin()); person.setDin(request.din()); person.setHasDsc(request.hasDsc()); person.setSharesPercentage(request.sharesPercentage());
        person.setResidentialAddress(request.residentialAddress()); person.setIsResidentInIndia(request.isResidentInIndia()); person.setAddressLine1(request.addressLine1());
        person.setAddressLine2(request.addressLine2()); person.setCity(request.city()); person.setDistrict(request.district()); person.setState(request.state()); person.setPinCode(request.pinCode());
        person.setSameAsPermanentAddress(request.sameAsPermanentAddress()); person.setPresentAddressLine1(request.presentAddressLine1()); person.setPresentAddressLine2(request.presentAddressLine2());
        person.setPresentCity(request.presentCity()); person.setPresentDistrict(request.presentDistrict()); person.setPresentState(request.presentState()); person.setPresentPincode(request.presentPincode());
        person.setNumberOfShares(request.numberOfShares()); person.setAmountSubscribed(request.amountSubscribed()); person.setContributionAmount(request.contributionAmount());
        person.setProfitSharePercentage(request.profitSharePercentage()); person.setCapitalContribution(request.capitalContribution()); person.setProfitSharingRatio(request.profitSharingRatio());
        person.setRelationship(request.relationship()); person.setIdentityProofDocName(request.identityProofDocName()); person.setResidentialAddressProofDocName(request.residentialAddressProofDocName());
        return personRepository.save(person);
    }

    private String toBackendStatus(String status, String paymentStatus) {
        if ("Submitted".equalsIgnoreCase(status) || "Paid".equalsIgnoreCase(paymentStatus)) return "SUBMITTED";
        if (StringUtils.hasText(status)) return status.toUpperCase().replace(' ', '_');
        return "DRAFT";
    }

    private CompanyRegistrationDocumentType parseDocumentType(String id) {
        try {
            return CompanyRegistrationDocumentType.valueOf(id);
        } catch (Exception exception) {
            throw new CompanyRegistrationValidationException("Unknown document type: " + id);
        }
    }

    private <T> List<T> nullSafe(List<T> values) {
        return values == null ? List.of() : values;
    }

    @Override
    @Transactional
    public CompanyRegistrationResponse create(CreateCompanyRegistrationRequest request) {
        requireText(request == null ? null : request.companyType(), "companyType is required");
        if (request.applicationId() != null) {
            CompanyRegistration existing = owned(request.applicationId());
            existing.setCompanyType(request.companyType());
            existing.setCurrentStep(request.currentStep() == null ? 1 : request.currentStep());
            return summary(registrationRepository.save(existing));
        }
        CompanyRegistration registration = new CompanyRegistration();
        registration.setUserId(currentUserId());
        registration.setCompanyType(request.companyType());
        registration.setStatus("DRAFT");
        registration.setCurrentStep(1);
        registration.setApplicationNumber("PENDING");
        registration = registrationRepository.save(registration);
        registration.setApplicationNumber(String.format("CR%d%06d", Year.now().getValue(), registration.getId()));
        return summary(registrationRepository.save(registration));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyRegistrationResponse> list() {
        return registrationRepository.findAllByUserIdOrderByCreatedAtDesc(currentUserId()).stream().map(this::summary).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewResponse get(Long id) {
        return application(id);
    }

    @Override
    @Transactional
    public Map<String, Object> updateDetails(Long id, CompanyDetailsRequest request) {
        CompanyRegistration registration = owned(id);
        requireText(request.primaryActivity(), "primaryActivity is required");
        requireText(request.nicCode(), "nicCode is required");
        requireText(request.proposedName1(), "proposedName1 is required");
        requireText(request.proposedName2(), "proposedName2 is required");
        CompanyDetails details = detailsRepository.findByRegistrationId(id).orElseGet(CompanyDetails::new);
        details.setRegistration(registration);
        details.setIndustryCategory(request.industryCategory());
        details.setBusinessActivityDescription(request.businessActivityDescription());
        details.setCompanyClass(request.companyClass());
        details.setCompanyCategory(request.companyCategory());
        details.setCompanySubCategory(request.companySubCategory());
        details.setPrimaryActivity(request.primaryActivity());
        details.setNicCode(request.nicCode());
        details.setSecondaryActivity(request.secondaryActivity());
        details.setProposedName1(request.proposedName1());
        details.setProposedName2(request.proposedName2());
        details.setProposedName3(request.proposedName3());
        details.setNameSuffix(request.nameSuffix());
        details.setNameAvailabilityStatus(request.nameAvailabilityStatus());
        details.setCompanyEmail(request.companyEmail());
        details.setCompanyMobile(request.companyMobile());
        detailsRepository.save(details);
        advance(registration, 2);
        return mapDetails(details);
    }

    @Override
    @Transactional
    public Map<String, Object> updateOffice(Long id, RegisteredOfficeRequest request) {
        CompanyRegistration registration = owned(id);
        requireText(request.addressLine(), "addressLine is required");
        requireText(request.city(), "city is required");
        requireText(request.state(), "state is required");
        requireText(request.pincode(), "pincode is required");
        CompanyRegisteredOffice office = officeRepository.findByRegistrationId(id).orElseGet(CompanyRegisteredOffice::new);
        office.setRegistration(registration);
        office.setAddressLine(request.addressLine());
        office.setCity(request.city());
        office.setDistrict(request.district());
        office.setState(request.state());
        office.setPincode(request.pincode());
        office.setPremisesOwnership(request.premisesOwnership());
        office.setOfficeAddressProofName(request.officeAddressProofName());
        office.setOfficeAddressProofUri(request.officeAddressProofUri());
        office.setOwnershipDocName(request.ownershipDocName());
        office.setOwnershipDocUri(request.ownershipDocUri());
        office.setOwnerNocName(request.ownerNocName());
        office.setOwnerNocUri(request.ownerNocUri());
        officeRepository.save(office);
        advance(registration, 3);
        return mapOffice(office);
    }

    @Override @Transactional(readOnly = true)
    public List<Map<String, Object>> persons(Long id) { owned(id); return personRepository.findAllByRegistrationIdOrderByIdAsc(id).stream().map(this::mapPerson).toList(); }

    @Override @Transactional
    public Map<String, Object> addPerson(Long id, PersonRequest request) {
        CompanyRegistration registration = owned(id);
        validatePerson(request);
        CompanyPerson person = personRepository.findAllByRegistrationIdOrderByIdAsc(id).stream()
            .filter(existing -> Objects.equals(existing.getPersonType(), request.personType()))
            .filter(existing -> existing.getPan().equalsIgnoreCase(request.pan()))
            .findFirst()
            .orElseGet(CompanyPerson::new);
        person.setRegistration(registration);
        applyPerson(person, request);
        return mapPerson(personRepository.save(person));
    }

    @Override @Transactional
    public Map<String, Object> updatePerson(Long id, Long personId, PersonRequest request) {
        owned(id);
        CompanyPerson person = personRepository.findById(personId).filter(p -> p.getRegistration().getId().equals(id)).orElseThrow(() -> new CompanyRegistrationNotFoundException("Person not found"));
        validatePerson(request);
        applyPerson(person, request);
        return mapPerson(personRepository.save(person));
    }

    @Override @Transactional
    public void deletePerson(Long id, Long personId) { owned(id); CompanyPerson person = personRepository.findById(personId).filter(p -> p.getRegistration().getId().equals(id)).orElseThrow(() -> new CompanyRegistrationNotFoundException("Person not found")); personRepository.delete(person); }

    @Override @Transactional
    public Map<String, Object> updateCapital(Long id, CapitalRequest request) {
        CompanyRegistration registration = owned(id);
        if (request.authorizedCapital() == null || request.paidUpCapital() == null) throw new CompanyRegistrationValidationException("authorizedCapital and paidUpCapital are required");
        CompanyCapital capital = capitalRepository.findByRegistrationId(id).orElseGet(CompanyCapital::new);
        capital.setRegistration(registration); capital.setAuthorizedCapital(request.authorizedCapital()); capital.setPaidUpCapital(request.paidUpCapital()); capital.setNumberOfShares(request.numberOfShares()); capital.setFaceValuePerShare(request.faceValuePerShare());
        advance(registration, 5); return mapCapital(capitalRepository.save(capital));
    }

    @Override @Transactional(readOnly = true)
    public List<Map<String, Object>> shareholdings(Long id) { owned(id); return shareholdingRepository.findAllByRegistrationIdOrderByIdAsc(id).stream().map(this::mapShareholding).toList(); }

    @Override @Transactional
    public Map<String, Object> addShareholding(Long id, ShareholdingRequest request) { CompanyRegistration registration = owned(id); CompanyShareholding item = shareholdingRepository.findAllByRegistrationIdOrderByIdAsc(id).stream().filter(existing -> Objects.equals(existing.getPerson(), request.person())).findFirst().orElseGet(CompanyShareholding::new); item.setRegistration(registration); applyShareholding(item, request); return mapShareholding(shareholdingRepository.save(item)); }

    @Override @Transactional
    public Map<String, Object> updateShareholding(Long id, Long shareholdingId, ShareholdingRequest request) { owned(id); CompanyShareholding item = shareholdingRepository.findById(shareholdingId).filter(s -> s.getRegistration().getId().equals(id)).orElseThrow(() -> new CompanyRegistrationNotFoundException("Shareholding not found")); applyShareholding(item, request); return mapShareholding(shareholdingRepository.save(item)); }

    @Override @Transactional
    public void deleteShareholding(Long id, Long shareholdingId) { owned(id); CompanyShareholding item = shareholdingRepository.findById(shareholdingId).filter(s -> s.getRegistration().getId().equals(id)).orElseThrow(() -> new CompanyRegistrationNotFoundException("Shareholding not found")); shareholdingRepository.delete(item); }

    @Override @Transactional(readOnly = true)
    public List<DocumentResponse> documents(Long id) { owned(id); return documentRepository.findAllByRegistrationIdOrderByIdAsc(id).stream().map(this::documentResponse).toList(); }

    @Override @Transactional(readOnly = true)
    public DocumentResponse document(Long id, Long documentId) { owned(id); return documentResponse(documentRepository.findById(documentId).filter(d -> d.getRegistration().getId().equals(id)).orElseThrow(() -> new CompanyRegistrationNotFoundException("Document not found"))); }

    @Override @Transactional
    public DocumentResponse uploadDocument(Long id, CompanyRegistrationDocumentType documentType, MultipartFile file) {
        CompanyRegistration registration = owned(id);
        if (documentType == null) throw new CompanyRegistrationValidationException("documentType is required");
        if (file == null || file.isEmpty()) throw new CompanyRegistrationValidationException("file is required");
        try {
            List<CompanyRegistrationDocument> matchingDocuments = documentRepository.findAllByRegistrationIdOrderByIdAsc(id).stream()
                    .filter(existing -> existing.getDocumentType() == documentType)
                    .toList();
            CompanyRegistrationDocument document = matchingDocuments.isEmpty()
                    ? new CompanyRegistrationDocument()
                    : matchingDocuments.get(0);
            document.setRegistration(registration); document.setCustId(registration.getUserId()); document.setDocumentType(documentType); document.setName(documentType.name()); document.setCategory("Company Registration"); document.setRequired(true); document.setFileName(StringUtils.hasText(file.getOriginalFilename()) ? file.getOriginalFilename() : "upload"); document.setFileData(Base64.getEncoder().encodeToString(file.getBytes())); document.setFileSize(file.getSize()); document.setMimeType(file.getContentType()); document.setStatus("UPLOADED"); document.setUploadedAt(LocalDateTime.now());
            document = documentRepository.save(document);
            if (matchingDocuments.size() > 1) {
                documentRepository.deleteAll(matchingDocuments.subList(1, matchingDocuments.size()));
            }
            return documentResponse(document);
        } catch (IOException ex) { throw new CompanyRegistrationException("Unable to read uploaded document", ex); }
    }

    @Override @Transactional
    public void deleteDocument(Long id, Long documentId) { owned(id); CompanyRegistrationDocument document = documentRepository.findById(documentId).filter(d -> d.getRegistration().getId().equals(id)).orElseThrow(() -> new CompanyRegistrationNotFoundException("Document not found")); documentRepository.delete(document); }

    @Override @Transactional
    public Map<String, Object> updateLinkedRegistrations(Long id, LinkedRegistrationRequest request) { CompanyRegistration registration = owned(id); CompanyLinkedRegistration linked = linkedRepository.findByRegistrationId(id).orElseGet(CompanyLinkedRegistration::new); linked.setRegistration(registration); linked.setPan(request.pan()); linked.setTan(request.tan()); linked.setGst(request.gst()); linked.setEsic(request.esic()); linked.setEpfo(request.epfo()); linked.setProfessionalTax(request.professionalTax()); linked.setBankAccount(request.bankAccount()); advance(registration, 7); return mapLinked(linkedRepository.save(linked)); }

    @Override @Transactional(readOnly = true)
    public Map<String, Object> linkedRegistrations(Long id) { owned(id); return linkedRepository.findByRegistrationId(id).map(this::mapLinked).orElseGet(HashMap::new); }

    @Override @Transactional(readOnly = true)
    public Map<String, Object> payment(Long id) { owned(id); return paymentRepository.findAllByRegistrationIdOrderByCreatedAtDesc(id).stream().findFirst().map(this::mapPayment).orElseGet(HashMap::new); }

    @Override @Transactional
    public Map<String, Object> savePayment(Long id, PaymentRequest request) { CompanyRegistration registration = owned(id); CompanyRegistrationPayment payment = new CompanyRegistrationPayment(); payment.setRegistration(registration); payment.setAmount(request.amount()); payment.setGovernmentFee(request.governmentFee()); payment.setProfessionalFee(request.professionalFee()); payment.setTotalAmount(request.totalAmount()); payment.setPaymentStatus(StringUtils.hasText(request.paymentStatus()) ? request.paymentStatus() : "PENDING"); payment.setTransactionId(request.transactionId()); payment.setPaymentGateway(request.paymentGateway()); payment.setPaymentMethod(request.paymentMethod()); if ("PAID".equalsIgnoreCase(payment.getPaymentStatus())) { payment.setPaidAt(LocalDateTime.now()); registration.setStatus("PAYMENT_SUCCESS"); } return mapPayment(paymentRepository.save(payment)); }

    @Override @Transactional(readOnly = true)
    public List<TrackingResponse> tracking(Long id) { owned(id); return trackingRepository.findAllByRegistrationIdOrderByIdAsc(id).stream().map(this::mapTracking).toList(); }

    @Override @Transactional(readOnly = true)
    public ReviewResponse review(Long id) { return application(id); }

    @Override @Transactional
    public SubmissionResponse submit(Long id) {
        CompanyRegistration registration = owned(id);
        detailsRepository.findByRegistrationId(id)
            .orElseThrow(() -> new CompanyRegistrationValidationException("Company details are required"));
        officeRepository.findByRegistrationId(id)
            .orElseThrow(() -> new CompanyRegistrationValidationException("Registered office is required"));
        if (personRepository.findAllByRegistrationIdOrderByIdAsc(id).isEmpty()) {
            throw new CompanyRegistrationValidationException("At least one director, promoter, or partner is required");
        }
        CompanyCapital capital = capitalRepository.findByRegistrationId(id)
            .orElseThrow(() -> new CompanyRegistrationValidationException("Capital details are required"));
        if (capital.getAuthorizedCapital() == null || capital.getPaidUpCapital() == null) {
            throw new CompanyRegistrationValidationException("Capital details are incomplete");
        }

        Set<CompanyRegistrationDocumentType> required = Set.of(
            CompanyRegistrationDocumentType.DIRECTOR_PAN,
            CompanyRegistrationDocumentType.DIRECTOR_ID_PROOF,
            CompanyRegistrationDocumentType.REGISTERED_OFFICE_PROOF,
            CompanyRegistrationDocumentType.OFFICE_UTILITY_BILL);
        Set<CompanyRegistrationDocumentType> uploaded = documentRepository.findAllByRegistrationIdOrderByIdAsc(id)
            .stream()
            .filter(document -> "UPLOADED".equalsIgnoreCase(document.getStatus()))
            .map(CompanyRegistrationDocument::getDocumentType)
            .collect(Collectors.toSet());
        if (!uploaded.containsAll(required)) {
            throw new CompanyRegistrationValidationException("Mandatory documents are missing");
        }

        registration.setStatus("SUBMITTED");
        registration.setSubmittedAt(LocalDateTime.now());
        registration.setCurrentStep(10);
        CompanyRegistration saved = registrationRepository.save(registration);
        return new SubmissionResponse(
            saved.getId(), saved.getApplicationNumber(), saved.getStatus(), saved.getSubmittedAt());
    }

    @Override @Transactional(readOnly = true)
    public ReceiptResponse receipt(Long id) { ReviewResponse response = application(id); return new ReceiptResponse(response.application().id(), response.application().applicationNumber(), response.application().companyType(), response.application().status(), response.application().updatedAt(), response.payments().stream().findFirst().orElseGet(HashMap::new)); }

    private ReviewResponse application(Long id) {
        CompanyRegistration registration = owned(id);
        return new ReviewResponse(summary(registration), detailsRepository.findByRegistrationId(id).map(this::mapDetails).orElseGet(HashMap::new), officeRepository.findByRegistrationId(id).map(this::mapOffice).orElseGet(HashMap::new), personRepository.findAllByRegistrationIdOrderByIdAsc(id).stream().map(this::mapPerson).toList(), capitalRepository.findByRegistrationId(id).map(this::mapCapital).orElseGet(HashMap::new), shareholdingRepository.findAllByRegistrationIdOrderByIdAsc(id).stream().map(this::mapShareholding).toList(), documentRepository.findAllByRegistrationIdOrderByIdAsc(id).stream().map(this::documentResponse).toList(), linkedRepository.findByRegistrationId(id).map(this::mapLinked).orElseGet(HashMap::new), paymentRepository.findAllByRegistrationIdOrderByCreatedAtDesc(id).stream().map(this::mapPayment).toList(), trackingRepository.findAllByRegistrationIdOrderByIdAsc(id).stream().map(this::mapTracking).toList());
    }

    private CompanyRegistration owned(Long id) { return registrationRepository.findByIdAndUserId(id, currentUserId()).orElseThrow(() -> new CompanyRegistrationNotFoundException("Company registration not found")); }
    private String currentUserId() { Authentication authentication = SecurityContextHolder.getContext().getAuthentication(); if (authentication == null || !(authentication.getPrincipal() instanceof JwtPrincipal principal)) throw new CompanyRegistrationNotFoundException("Authenticated customer is required"); return principal.custId(); }
    private void advance(CompanyRegistration registration, int step) { registration.setCurrentStep(step); if ("DRAFT".equals(registration.getStatus())) registration.setStatus("IN_PROGRESS"); registrationRepository.save(registration); }
    private void requireText(String value, String message) { if (!StringUtils.hasText(value)) throw new CompanyRegistrationValidationException(message); }
    private void validatePerson(PersonRequest request) { requireText(request.name(), "person name is required"); requireText(request.pan(), "person PAN is required"); requireText(request.email(), "person email is required"); }
    private void applyPerson(CompanyPerson p, PersonRequest r) { p.setPersonType(r.personType()); p.setName(r.name()); p.setPan(r.pan()); p.setAadhaar(r.aadhaar()); p.setDob(r.dob()); p.setFatherName(r.fatherName()); p.setGender(r.gender()); p.setNationality(r.nationality()); p.setPlaceOfBirth(r.placeOfBirth()); p.setOccupation(r.occupation()); p.setEducationalQualification(r.educationalQualification()); p.setDesignation(r.designation()); p.setCategory(r.category()); p.setEmail(r.email()); p.setPhone(r.phone()); p.setHasDin(r.hasDin()); p.setDin(r.din()); p.setHasDsc(r.hasDsc()); p.setSharesPercentage(r.sharesPercentage()); p.setResidentialAddress(r.residentialAddress()); p.setIsResidentInIndia(r.isResidentInIndia()); p.setAddressLine1(r.addressLine1()); p.setAddressLine2(r.addressLine2()); p.setCity(r.city()); p.setDistrict(r.district()); p.setState(r.state()); p.setPinCode(r.pinCode()); p.setSameAsPermanentAddress(r.sameAsPermanentAddress()); p.setPresentAddressLine1(r.presentAddressLine1()); p.setPresentAddressLine2(r.presentAddressLine2()); p.setPresentCity(r.presentCity()); p.setPresentDistrict(r.presentDistrict()); p.setPresentState(r.presentState()); p.setPresentPincode(r.presentPincode()); p.setNumberOfShares(r.numberOfShares()); p.setAmountSubscribed(r.amountSubscribed()); p.setContributionAmount(r.contributionAmount()); p.setProfitSharePercentage(r.profitSharePercentage()); p.setCapitalContribution(r.capitalContribution()); p.setProfitSharingRatio(r.profitSharingRatio()); p.setRelationship(r.relationship()); p.setIdentityProofDocName(r.identityProofDocName()); p.setResidentialAddressProofDocName(r.residentialAddressProofDocName()); }
    private void applyShareholding(CompanyShareholding item, ShareholdingRequest r) { item.setPerson(r.person()); item.setNumberOfShares(r.numberOfShares()); item.setShareValue(r.shareValue()); item.setPercentage(r.percentage()); }

    private CompanyRegistrationResponse summary(CompanyRegistration r) { return new CompanyRegistrationResponse(r.getId(), r.getApplicationNumber(), r.getCompanyType(), r.getStatus(), r.getCurrentStep(), r.getCreatedAt(), r.getUpdatedAt()); }
    private Map<String, Object> mapDetails(CompanyDetails d) { Map<String,Object> m = new LinkedHashMap<>(); m.put("id",d.getId()); m.put("industryCategory",d.getIndustryCategory()); m.put("businessActivityDescription",d.getBusinessActivityDescription()); m.put("companyClass",d.getCompanyClass()); m.put("companyCategory",d.getCompanyCategory()); m.put("companySubCategory",d.getCompanySubCategory()); m.put("primaryActivity",d.getPrimaryActivity()); m.put("nicCode",d.getNicCode()); m.put("secondaryActivity",d.getSecondaryActivity()); m.put("proposedName1",d.getProposedName1()); m.put("proposedName2",d.getProposedName2()); m.put("proposedName3",d.getProposedName3()); m.put("nameSuffix",d.getNameSuffix()); m.put("nameAvailabilityStatus",d.getNameAvailabilityStatus()); m.put("companyEmail",d.getCompanyEmail()); m.put("companyMobile",d.getCompanyMobile()); return m; }
    private Map<String, Object> mapOffice(CompanyRegisteredOffice o) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", o.getId()); result.put("addressLine", o.getAddressLine()); result.put("city", o.getCity());
        result.put("district", Objects.toString(o.getDistrict(), "")); result.put("state", o.getState());
        result.put("pincode", o.getPincode()); result.put("premisesOwnership", Objects.toString(o.getPremisesOwnership(), ""));
        result.put("officeAddressProofName", o.getOfficeAddressProofName()); result.put("officeAddressProofUri", o.getOfficeAddressProofUri());
        result.put("ownershipDocName", o.getOwnershipDocName()); result.put("ownershipDocUri", o.getOwnershipDocUri());
        result.put("ownerNocName", o.getOwnerNocName()); result.put("ownerNocUri", o.getOwnerNocUri());
        return result;
    }
    private Map<String, Object> mapPerson(CompanyPerson p) { Map<String,Object> m = new LinkedHashMap<>(); m.put("id",p.getId()); m.put("personType",p.getPersonType()); m.put("name",p.getName()); m.put("pan",p.getPan()); m.put("aadhaar",p.getAadhaar()); m.put("dob",p.getDob()); m.put("fatherName",p.getFatherName()); m.put("gender",p.getGender()); m.put("nationality",p.getNationality()); m.put("placeOfBirth",p.getPlaceOfBirth()); m.put("occupation",p.getOccupation()); m.put("educationalQualification",p.getEducationalQualification()); m.put("designation",p.getDesignation()); m.put("category",p.getCategory()); m.put("email",p.getEmail()); m.put("phone",p.getPhone()); m.put("hasDin",p.getHasDin()); m.put("din",p.getDin()); m.put("hasDsc",p.getHasDsc()); m.put("sharesPercentage",p.getSharesPercentage()); m.put("residentialAddress",p.getResidentialAddress()); m.put("isResidentInIndia",p.getIsResidentInIndia()); m.put("addressLine1",p.getAddressLine1()); m.put("addressLine2",p.getAddressLine2()); m.put("city",p.getCity()); m.put("district",p.getDistrict()); m.put("state",p.getState()); m.put("pinCode",p.getPinCode()); m.put("sameAsPermanentAddress",p.getSameAsPermanentAddress()); m.put("presentAddressLine1",p.getPresentAddressLine1()); m.put("presentAddressLine2",p.getPresentAddressLine2()); m.put("presentCity",p.getPresentCity()); m.put("presentDistrict",p.getPresentDistrict()); m.put("presentState",p.getPresentState()); m.put("presentPincode",p.getPresentPincode()); m.put("numberOfShares",p.getNumberOfShares()); m.put("amountSubscribed",p.getAmountSubscribed()); m.put("contributionAmount",p.getContributionAmount()); m.put("profitSharePercentage",p.getProfitSharePercentage()); m.put("capitalContribution",p.getCapitalContribution()); m.put("profitSharingRatio",p.getProfitSharingRatio()); m.put("relationship",p.getRelationship()); m.put("identityProofDocName",p.getIdentityProofDocName()); m.put("residentialAddressProofDocName",p.getResidentialAddressProofDocName()); return m; }
    private Map<String, Object> mapCapital(CompanyCapital c) { return new LinkedHashMap<>(Map.of("id",c.getId(),"authorizedCapital",c.getAuthorizedCapital(),"paidUpCapital",c.getPaidUpCapital(),"numberOfShares",Objects.toString(c.getNumberOfShares(),""),"faceValuePerShare",Objects.toString(c.getFaceValuePerShare(),""))); }
    private Map<String, Object> mapShareholding(CompanyShareholding s) { return new LinkedHashMap<>(Map.of("id",s.getId(),"person",Objects.toString(s.getPerson(),""),"numberOfShares",Objects.toString(s.getNumberOfShares(),""),"shareValue",Objects.toString(s.getShareValue(),""),"percentage",Objects.toString(s.getPercentage(),""))); }
    private Map<String, Object> mapLinked(CompanyLinkedRegistration l) { return new LinkedHashMap<>(Map.of("pan",l.isPan(),"tan",l.isTan(),"gst",l.isGst(),"esic",l.isEsic(),"epfo",l.isEpfo(),"professionalTax",l.isProfessionalTax(),"bankAccount",l.isBankAccount())); }
    private Map<String, Object> mapPayment(CompanyRegistrationPayment p) { return new LinkedHashMap<>(Map.of("id",p.getId(),"amount",Objects.toString(p.getAmount(),""),"governmentFee",Objects.toString(p.getGovernmentFee(),""),"professionalFee",Objects.toString(p.getProfessionalFee(),""),"totalAmount",Objects.toString(p.getTotalAmount(),""),"paymentStatus",p.getPaymentStatus(),"transactionId",Objects.toString(p.getTransactionId(),""),"paymentGateway",Objects.toString(p.getPaymentGateway(),""),"paymentMethod",Objects.toString(p.getPaymentMethod(),""),"paidAt",Objects.toString(p.getPaidAt(),""))); }
    private TrackingResponse mapTracking(CompanyRegistrationTracking t) { return new TrackingResponse(t.getId(), t.getStage(), t.getStatus(), Objects.toString(t.getDescription(), ""), t.getStartedAt(), t.getCompletedAt(), t.getRemarks()); }
    private DocumentResponse documentResponse(CompanyRegistrationDocument d) { return new DocumentResponse(d.getId(), d.getCustId(), d.getDocumentType().name(), d.getName(), d.getCategory(), d.isRequired(), d.getFileName(), d.getFileUri(), d.getFileSize(), d.getMimeType(), d.getStatus(), d.getUploadedAt(), d.getVerifiedAt(), d.getRemarks()); }
}
