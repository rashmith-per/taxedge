import { useState, useEffect } from "react";
import { apiClient } from "@/core/api/apiClient";
import { gstAmendmentApi } from "@/modules/gst/services/gstAmendmentApi";
import { RegisteredDetails } from "../types/gstAmendmentTypes";

export function useGstAmendmentDetails(
  targetGstId: string,
  selectedSectionId: string
): RegisteredDetails {
  const [registeredDetails, setRegisteredDetails] = useState<RegisteredDetails>({
    legalBusinessName: "-",
    principalAddress: "-",
    principalCity: "-",
    principalDistrict: "-",
    principalState: "-",
    principalPincode: "-",
    principalProofType: "-",
    additionalAddress: "-",
    additionalCity: "-",
    additionalPincode: "-",
    additionalNatureOfPremises: "-",
    bankName: "-",
    bankAccountNumber: "-",
    ifscCode: "-",
    accountType: "-",
    signatoryName: "-",
    signatoryPan: "-",
    signatoryDesignation: "-",
    signatoryMobile: "-",
    signatoryEmail: "-",
    contactMobile: "-",
    contactEmail: "-",
  });

  useEffect(() => {
    let isMounted = true;

    const fetchAllRegisteredDetails = async () => {
      try {
        const idToFetch = targetGstId || "DEFAULT";

        const [
          businessRes,
          legalRes,
          principalRes,
          additionalRes,
          bankRes,
          signatoryRes,
          contactRes,
        ] = await Promise.allSettled([
          apiClient.get<any>(`/api/v1/gst/business/${idToFetch}`),
          gstAmendmentApi.getExistingLegalName(idToFetch),
          gstAmendmentApi.getExistingPrincipalPlace(idToFetch),
          gstAmendmentApi.getExistingAdditionalPlace(idToFetch),
          gstAmendmentApi.getExistingBankAccount(idToFetch),
          gstAmendmentApi.getExistingSignatory(idToFetch),
          gstAmendmentApi.getExistingContact(idToFetch),
        ]);

        if (!isMounted) return;

        setRegisteredDetails((prev) => {
          const updated = { ...prev };

          if (businessRes.status === "fulfilled" && businessRes.value) {
            const b = businessRes.value;
            if (b.legalName) updated.legalBusinessName = b.legalName;
            else if (b.tradeName) updated.legalBusinessName = b.tradeName;

            if (b.businessAddress) updated.principalAddress = b.businessAddress;
            if (b.city) updated.principalCity = b.city;
            if (b.district) updated.principalDistrict = b.district;
            if (b.state) updated.principalState = b.state;
            if (b.pinCode) updated.principalPincode = b.pinCode;

            if (b.businessAddress) updated.additionalAddress = b.businessAddress;
            if (b.city) updated.additionalCity = b.city;
            if (b.pinCode) updated.additionalPincode = b.pinCode;
            if (b.natureOfBusiness) updated.additionalNatureOfPremises = String(b.natureOfBusiness);

            if (b.bankName) updated.bankName = b.bankName;
            if (b.bankAccountNumber) updated.bankAccountNumber = b.bankAccountNumber;
            if (b.ifscCode) updated.ifscCode = b.ifscCode;
            if (b.accountType) updated.accountType = b.accountType;

            if (b.signatoryName) updated.signatoryName = b.signatoryName;
            else if (b.authorisedSignatory) updated.signatoryName = b.authorisedSignatory;
            else if (b.accountHolderName) updated.signatoryName = b.accountHolderName;

            if (b.signatoryPan) updated.signatoryPan = b.signatoryPan;
            if (b.designation) updated.signatoryDesignation = b.designation;
            if (b.signatoryMobile) {
              updated.signatoryMobile = b.signatoryMobile;
              updated.contactMobile = b.signatoryMobile;
            }
            if (b.signatoryEmail) {
              updated.signatoryEmail = b.signatoryEmail;
              updated.contactEmail = b.signatoryEmail;
            }
          }

          if (legalRes.status === "fulfilled" && legalRes.value?.newLegalName) {
            updated.legalBusinessName = legalRes.value.newLegalName;
          }

          if (principalRes.status === "fulfilled" && principalRes.value) {
            const p = principalRes.value;
            if (p.newBusinessAddress) updated.principalAddress = p.newBusinessAddress;
            if (p.newCity) updated.principalCity = p.newCity;
            if (p.newDistrict) updated.principalDistrict = p.newDistrict;
            if (p.newState) updated.principalState = p.newState;
            if (p.newPinCode) updated.principalPincode = p.newPinCode;
          }

          if (additionalRes.status === "fulfilled" && additionalRes.value) {
            const addList = Array.isArray(additionalRes.value) ? additionalRes.value : [additionalRes.value];
            if (addList.length > 0 && addList[0]) {
              const a = addList[0];
              if (a.address) updated.additionalAddress = a.address;
              if (a.city) updated.additionalCity = a.city;
              if (a.pinCode) updated.additionalPincode = a.pinCode;
              if (a.natureOfPremises) updated.additionalNatureOfPremises = String(a.natureOfPremises);
            }
          }

          if (bankRes.status === "fulfilled" && bankRes.value) {
            const bk = bankRes.value;
            if (bk.newBankName) updated.bankName = bk.newBankName;
            if (bk.newBankAccountNumber) updated.bankAccountNumber = bk.newBankAccountNumber;
            if (bk.newIfscCode) updated.ifscCode = bk.newIfscCode;
            if (bk.newAccountType) updated.accountType = bk.newAccountType;
          }

          if (signatoryRes.status === "fulfilled" && signatoryRes.value) {
            const s = signatoryRes.value;
            if (s.newSignatoryName) updated.signatoryName = s.newSignatoryName;
            if (s.newSignatoryPan) updated.signatoryPan = s.newSignatoryPan;
            if (s.newDesignation) updated.signatoryDesignation = s.newDesignation;
            if (s.newSignatoryMobile) updated.signatoryMobile = s.newSignatoryMobile;
            if (s.newSignatoryEmail) updated.signatoryEmail = s.newSignatoryEmail;
          }

          if (contactRes.status === "fulfilled" && contactRes.value) {
            const c = contactRes.value;
            if (c.newMobileNumber) updated.contactMobile = c.newMobileNumber;
            if (c.newEmail) updated.contactEmail = c.newEmail;
          }

          return updated;
        });
      } catch (err) {
        console.warn("Error fetching registered amendment details from database:", err);
      }
    };

    fetchAllRegisteredDetails();

    return () => {
      isMounted = false;
    };
  }, [targetGstId, selectedSectionId]);

  return registeredDetails;
}
