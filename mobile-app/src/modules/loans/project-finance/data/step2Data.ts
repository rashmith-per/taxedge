import {
  CapacityProductionForm,
  PlantMachineryItem,
  RawMaterialItem,
  EpcExecutionForm,
  ImplementationMilestoneItem,
  ManpowerForm,
} from "../types/step2Types";

export const CAPACITY_UNITS = [
  "MT / Annum",
  "Units / Day",
  "Litres / Day",
  "Kg / Day",
  "Pieces / Month",
  "KW / MW",
  "Other",
];

export const SHIFT_OPTIONS = [
  "1 Shift (8 Hours)",
  "2 Shifts (16 Hours)",
  "3 Shifts (24 Hours)",
  "Continuous (24x7)",
];

export const MACHINERY_CATEGORIES = [
  "Indigenous Machinery",
  "Imported Equipment",
  "Auxiliary Equipment",
  "Testing & Laboratory",
  "Packaging Line",
  "Other",
];

export const RAW_MATERIAL_SOURCES = [
  "Indigenous Market",
  "Imported",
  "Captive Supply",
  "Open Market",
  "Contracted Sourcing",
];

export const RAW_MATERIAL_UNITS = [
  "MT",
  "Kg",
  "Litres",
  "Pieces",
  "Units",
  "Barrels",
];

export const EPC_CONTRACT_TYPES = [
  "Turnkey EPC",
  "Item Rate Contract",
  "Lump Sum",
  "PMC (Project Management)",
  "Cost Plus",
];

export const MILESTONE_STATUS_OPTIONS = [
  "Planned",
  "In Progress",
  "Completed",
  "Delayed",
  "On Hold",
];

export const INITIAL_CAPACITY_PRODUCTION: CapacityProductionForm = {
  proposedCapacity: "",
  capacityUnit: "",
  initialUtilisation: "",
  stabilisedUtilisation: "",
  productionPerYear: "",
  operatingDaysPerYear: "",
  numberOfShifts: "",
};

export const INITIAL_MACHINERIES: PlantMachineryItem[] = [
  {
    id: "1",
    machineryName: "",
    category: "",
    manufacturerSupplier: "",
    quantity: "",
    unitCost: "",
    totalCost: "",
  },
];

export const INITIAL_RAW_MATERIALS: RawMaterialItem[] = [
  {
    id: "1",
    mainRawMaterial: "",
    source: "",
    supplier: "",
    annualRequirement: "",
    unit: "",
    supplyAgreement: false,
  },
];

export const INITIAL_EPC_EXECUTION: EpcExecutionForm = {
  epcContractor: "",
  contractType: "",
  epcContractValue: "",
  epcAwardDate: "",
  constructionStartDate: "",
  expectedCompletionDate: "",
};

export const INITIAL_MILESTONES: ImplementationMilestoneItem[] = [
  {
    id: "1",
    milestone: "",
    plannedDate: "",
    actualDate: "",
    status: "Planned",
  },
];

export const INITIAL_MANPOWER: ManpowerForm = {
  totalEmployees: "",
  skilled: "",
  semiSkilled: "",
  unskilled: "",
  technicalStaff: "",
  administrativeStaff: "",
};
