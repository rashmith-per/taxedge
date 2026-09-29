package com.taxedge.companyregistration.dto.request;

public record RegisteredOfficeRequest(
	String addressLine, String city, String district, String state, String pincode,
	String premisesOwnership, String officeAddressProofName, String officeAddressProofUri,
	String ownershipDocName, String ownershipDocUri, String ownerNocName, String ownerNocUri) {}