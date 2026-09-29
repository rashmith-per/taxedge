export interface CapacityProductionForm {
  proposedCapacity: string;
  capacityUnit: string;
  initialUtilisation: string;
  stabilisedUtilisation: string;
  productionPerYear: string;
  operatingDaysPerYear: string;
  numberOfShifts: string;
}

export interface PlantMachineryItem {
  id: string;
  machineryName: string;
  category: string;
  manufacturerSupplier: string;
  quantity: string;
  unitCost: string;
  totalCost: string;
}

export interface RawMaterialItem {
  id: string;
  mainRawMaterial: string;
  source: string;
  supplier: string;
  annualRequirement: string;
  unit: string;
  supplyAgreement: boolean;
}

export interface EpcExecutionForm {
  epcContractor: string;
  contractType: string;
  epcContractValue: string;
  epcAwardDate: string;
  constructionStartDate: string;
  expectedCompletionDate: string;
}

export interface ImplementationMilestoneItem {
  id: string;
  milestone: string;
  plannedDate: string;
  actualDate: string;
  status: string;
}

export interface ManpowerForm {
  totalEmployees: string;
  skilled: string;
  semiSkilled: string;
  unskilled: string;
  technicalStaff: string;
  administrativeStaff: string;
}
