import {
  ApplicantDetailsForm,
  RegisteredAddressForm,
  PromoterSponsorItem,
  ProjectClassificationForm,
  ProjectLocationForm,
  LandDetailsForm,
  LandParcelItem,
  RightOfWayForm,
  UtilitiesForm,
  TechnicalDetailsForm,
  CapacityProductionForm,
  PlantMachineryItem,
  RawMaterialItem,
  EpcExecutionForm,
  ImplementationMilestoneItem,
  ManpowerForm,
} from "../types/projectFinance.types";

export interface Step1ValidationState {
  applicantDetails: ApplicantDetailsForm;
  registeredAddress: RegisteredAddressForm;
  promoters: PromoterSponsorItem[];
  projectClassification: ProjectClassificationForm;
}

export interface Step2ValidationState {
  projectLocation: ProjectLocationForm;
  landDetails: LandDetailsForm;
  parcels: LandParcelItem[];
  rightOfWay: RightOfWayForm;
  utilities: UtilitiesForm;
  technicalDetails: TechnicalDetailsForm;
  capacityProduction: CapacityProductionForm;
  machineries: PlantMachineryItem[];
  rawMaterials: RawMaterialItem[];
  epcExecution: EpcExecutionForm;
  milestones: ImplementationMilestoneItem[];
  manpower: ManpowerForm;
}

export const validateStep1 = (state: Step1ValidationState): string | null => {
  const { applicantDetails, registeredAddress, promoters, projectClassification } = state;

  // 1. Applicant Details
  if (!applicantDetails.applicantName?.trim()) {
    return "Please enter Applicant / Company Name.";
  }
  if (!applicantDetails.constitutionType?.trim()) {
    return "Please select Constitution / Entity Type.";
  }
  if (!applicantDetails.pan?.trim()) {
    return "Please enter Company / Entity PAN.";
  }
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
  if (!panRegex.test(applicantDetails.pan.trim())) {
    return "Please enter a valid 10-character PAN (e.g. ABCDE1234F).";
  }
  if (!applicantDetails.dateOfIncorporation?.trim()) {
    return "Please select Date of Incorporation / Registration.";
  }
  if (!applicantDetails.bankingRelationship?.trim()) {
    return "Please select Banking Relationship with Us.";
  }
  if (!applicantDetails.primaryBusinessActivity?.trim()) {
    return "Please select Primary Business Activity.";
  }

  // 2. Registered Address
  if (!registeredAddress.addressLine1?.trim()) {
    return "Please enter Registered Office Address Line 1.";
  }
  if (!registeredAddress.state?.trim()) {
    return "Please select Registered Office State.";
  }
  if (!registeredAddress.districtCity?.trim()) {
    return "Please select Registered Office District / City.";
  }
  if (!registeredAddress.pinCode?.trim()) {
    return "Please enter Registered Office PIN Code.";
  }
  const pinRegex = /^[1-9][0-9]{5}$/;
  if (!pinRegex.test(registeredAddress.pinCode.trim())) {
    return "Please enter a valid 6-digit Registered Office PIN Code.";
  }

  // 3. Promoters
  if (!promoters || promoters.length === 0) {
    return "Please add at least one Promoter / Key Sponsor.";
  }
  for (let i = 0; i < promoters.length; i++) {
    const p = promoters[i];
    const prefix = promoters.length > 1 ? `Promoter ${i + 1}: ` : "";
    if (!p.name?.trim()) {
      return `${prefix}Please enter Full Name.`;
    }
    if (p.sharePercentage === undefined || p.sharePercentage === null || isNaN(p.sharePercentage) || p.sharePercentage <= 0) {
      return `${prefix}Please enter Shareholding (%).`;
    }
  }

  // 4. Project Classification
  if (!projectClassification.projectName?.trim()) {
    return "Please enter Project Name.";
  }
  if (!projectClassification.projectSector?.trim()) {
    return "Please select Project Sector.";
  }
  if (!projectClassification.projectType?.trim()) {
    return "Please select Project Type.";
  }
  if (!projectClassification.developmentCategory?.trim()) {
    return "Please select Development Category.";
  }

  return null;
};

/** Project Location */
const checkProjectLocation = ({ projectLocation }: Pick<Step2ValidationState, "projectLocation">): string | null => {
  if (!projectLocation.projectAddress?.trim()) {
    return "Please enter Project Site Address.";
  }
  if (!projectLocation.state?.trim()) {
    return "Please select Project Site State.";
  }
  if (!projectLocation.district?.trim()) {
    return "Please select Project Site District.";
  }
  if (!projectLocation.pinCode?.trim()) {
    return "Please enter Project Site PIN Code.";
  }
  const pinRegex = /^[1-9][0-9]{5}$/;
  if (!pinRegex.test(projectLocation.pinCode.trim())) {
    return "Please enter a valid 6-digit Site PIN Code.";
  }
  if (!projectLocation.projectZone?.trim()) {
    return "Please select Project Zone / Category.";
  }

  return null;
};

/** Land Details */
const checkLandDetails = ({ landDetails }: Pick<Step2ValidationState, "landDetails">): string | null => {
  if (!landDetails.totalLandRequired?.trim()) {
    return "Please enter Total Land Required (Acres).";
  }
  if (!landDetails.landAvailable?.trim() && !landDetails.landAcquired?.trim()) {
    return "Please enter Land Available / Acquired (Acres).";
  }
  if (!landDetails.landOwnership?.trim()) {
    return "Please select Land Ownership Type.";
  }
  if (!landDetails.landUse?.trim()) {
    return "Please select Present Land Use.";
  }
  if (!landDetails.titleStatus?.trim()) {
    return "Please select Title Status.";
  }

  return null;
};

/** Land Parcels */
const checkLandParcels = ({ parcels }: Pick<Step2ValidationState, "parcels">): string | null => {
  if (!parcels || parcels.length === 0) {
    return "Please add at least one Land Parcel.";
  }
  for (let i = 0; i < parcels.length; i++) {
    const p = parcels[i];
    const prefix = parcels.length > 1 ? `Land Parcel ${i + 1}: ` : "";
    if (!p.surveyPlotNumber?.trim()) {
      return `${prefix}Please enter Survey / Plot Number.`;
    }
    if (!p.areaAcres?.trim()) {
      return `${prefix}Please enter Area (Acres).`;
    }
  }

  return null;
};

/** Right of Way */
const checkRightOfWay = ({ rightOfWay }: Pick<Step2ValidationState, "rightOfWay">): string | null => {
  if (rightOfWay.rowRequired) {
    if (!rightOfWay.rowType?.trim()) {
      return "Please select Right of Way Type.";
    }
    if (!rightOfWay.totalLengthKm?.trim()) {
      return "Please enter Total Length (km) for Right of Way.";
    }
  }

  return null;
};

/** Utilities */
const checkUtilities = ({ utilities }: Pick<Step2ValidationState, "utilities">): string | null => {
  if (!utilities.powerSource?.trim()) {
    return "Please select Power Requirement / Source.";
  }
  if (!utilities.waterSource?.trim()) {
    return "Please select Water Requirement / Source.";
  }
  if (!utilities.approachRoad?.trim()) {
    return "Please select Approach Road arrangement.";
  }

  return null;
};

/** Technical Details */
const checkTechnicalDetails = ({ technicalDetails }: Pick<Step2ValidationState, "technicalDetails">): string | null => {
  if (!technicalDetails.technologyType?.trim()) {
    return "Please select Technology Type.";
  }
  if (!technicalDetails.technologyDescription?.trim()) {
    return "Please enter Technology Description.";
  }

  return null;
};

/** Capacity & Production */
const checkCapacityProduction = ({ capacityProduction }: Pick<Step2ValidationState, "capacityProduction">): string | null => {
  if (!capacityProduction.proposedCapacity?.trim()) {
    return "Please enter Proposed Capacity.";
  }
  if (!capacityProduction.capacityUnit?.trim()) {
    return "Please select Unit of Measurement for Capacity.";
  }

  return null;
};

/** Plant & Machinery */
const checkPlantMachinery = ({ machineries }: Pick<Step2ValidationState, "machineries">): string | null => {
  if (!machineries || machineries.length === 0) {
    return "Please add at least one Plant & Machinery item.";
  }
  for (let i = 0; i < machineries.length; i++) {
    const m = machineries[i];
    const prefix = machineries.length > 1 ? `Machinery ${i + 1}: ` : "";
    if (!m.machineryName?.trim()) {
      return `${prefix}Please enter Machinery / Equipment Name.`;
    }
    if (!m.totalCost?.trim() && !m.unitCost?.trim()) {
      return `${prefix}Please enter Estimated Cost.`;
    }
  }

  return null;
};

/** Raw Material Inputs */
const checkRawMaterialInputs = ({ rawMaterials }: Pick<Step2ValidationState, "rawMaterials">): string | null => {
  if (!rawMaterials || rawMaterials.length === 0) {
    return "Please add at least one Raw Material item.";
  }
  for (let i = 0; i < rawMaterials.length; i++) {
    const r = rawMaterials[i];
    const prefix = rawMaterials.length > 1 ? `Raw Material ${i + 1}: ` : "";
    if (!r.mainRawMaterial?.trim()) {
      return `${prefix}Please enter Raw Material Name.`;
    }
    if (!r.annualRequirement?.trim()) {
      return `${prefix}Please enter Annual Requirement.`;
    }
  }

  return null;
};

/** EPC / Execution */
const checkEPCExecution = ({ epcExecution }: Pick<Step2ValidationState, "epcExecution">): string | null => {
  if (!epcExecution.contractType?.trim()) {
    return "Please select Execution Model / Contract Type.";
  }

  return null;
};

/** Implementation Milestones */
const checkImplementationMilestones = ({ milestones }: Pick<Step2ValidationState, "milestones">): string | null => {
  if (!milestones || milestones.length === 0) {
    return "Please add at least one Implementation Milestone.";
  }
  for (let i = 0; i < milestones.length; i++) {
    const ms = milestones[i];
    const prefix = milestones.length > 1 ? `Milestone ${i + 1}: ` : "";
    if (!ms.milestone?.trim()) {
      return `${prefix}Please enter Milestone Name.`;
    }
    if (!ms.plannedDate?.trim()) {
      return `${prefix}Please select Target / Planned Completion Date.`;
    }
  }

  return null;
};

/** Manpower */
const checkManpower = ({ manpower }: Pick<Step2ValidationState, "manpower">): string | null => {
  if (!manpower.totalEmployees?.trim()) {
    return "Please enter Total Manpower / Employees Required.";
  }

  return null;
};

export const validateStep2 = (state: Step2ValidationState): string | null => {
  // Sections are checked in order; the first failure wins.
  return (
    checkProjectLocation(state) ??
    checkLandDetails(state) ??
    checkLandParcels(state) ??
    checkRightOfWay(state) ??
    checkUtilities(state) ??
    checkTechnicalDetails(state) ??
    checkCapacityProduction(state) ??
    checkPlantMachinery(state) ??
    checkRawMaterialInputs(state) ??
    checkEPCExecution(state) ??
    checkImplementationMilestones(state) ??
    checkManpower(state) ??
    null
  );
};
