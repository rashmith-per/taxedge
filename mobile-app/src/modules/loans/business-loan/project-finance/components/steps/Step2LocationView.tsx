import React, { useState } from "react";
import { ProjectLocationCard } from "../ProjectLocationCard/ProjectLocationCard";
import { LandDetailsCard } from "../LandDetailsCard/LandDetailsCard";
import { LandParcelsCard } from "../LandParcelsCard/LandParcelsCard";
import { RightOfWayCard } from "../RightOfWayCard/RightOfWayCard";
import { UtilitiesCard } from "../UtilitiesCard/UtilitiesCard";
import { TechnicalDetailsCard } from "../TechnicalDetailsCard/TechnicalDetailsCard";
import { CapacityProductionCard } from "../CapacityProductionCard/CapacityProductionCard";
import { PlantMachineryCard } from "../PlantMachineryCard/PlantMachineryCard";
import { RawMaterialInputsCard } from "../RawMaterialInputsCard/RawMaterialInputsCard";
import { EpcExecutionCard } from "../EpcExecutionCard/EpcExecutionCard";
import { ImplementationMilestonesCard } from "../ImplementationMilestonesCard/ImplementationMilestonesCard";
import { ManpowerCard } from "../ManpowerCard/ManpowerCard";
import {
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
} from "../../types/projectFinance.types";

interface Step2LocationViewProps {
  projectLocation: ProjectLocationForm;
  onLocationChange: (field: keyof ProjectLocationForm, value: any) => void;
  landDetails: LandDetailsForm;
  onLandChange: (field: keyof LandDetailsForm, value: any) => void;
  parcels: LandParcelItem[];
  onAddParcel: () => void;
  onUpdateParcel: (id: string, field: keyof LandParcelItem, value: any) => void;
  onDeleteParcel: (id: string) => void;
  rightOfWay: RightOfWayForm;
  onRowChange: (field: keyof RightOfWayForm, value: any) => void;
  utilities: UtilitiesForm;
  onUtilitiesChange: (field: keyof UtilitiesForm, value: any) => void;
  technicalDetails: TechnicalDetailsForm;
  onTechnicalChange: (field: keyof TechnicalDetailsForm, value: any) => void;
  capacityProduction: CapacityProductionForm;
  onCapacityChange: (field: keyof CapacityProductionForm, value: string) => void;
  machineries: PlantMachineryItem[];
  onAddMachinery: () => void;
  onUpdateMachinery: (id: string, field: keyof PlantMachineryItem, value: string) => void;
  onDeleteMachinery: (id: string) => void;
  rawMaterials: RawMaterialItem[];
  onAddMaterial: () => void;
  onUpdateMaterial: (id: string, field: keyof RawMaterialItem, value: any) => void;
  onDeleteMaterial: (id: string) => void;
  epcExecution: EpcExecutionForm;
  onEpcChange: (field: keyof EpcExecutionForm, value: string) => void;
  milestones: ImplementationMilestoneItem[];
  onAddMilestone: () => void;
  onUpdateMilestone: (id: string, field: keyof ImplementationMilestoneItem, value: string) => void;
  onDeleteMilestone: (id: string) => void;
  manpower: ManpowerForm;
  onManpowerChange: (field: keyof ManpowerForm, value: string) => void;
}

export const Step2LocationView: React.FC<Step2LocationViewProps> = ({
  projectLocation,
  onLocationChange,
  landDetails,
  onLandChange,
  parcels,
  onAddParcel,
  onUpdateParcel,
  onDeleteParcel,
  rightOfWay,
  onRowChange,
  utilities,
  onUtilitiesChange,
  technicalDetails,
  onTechnicalChange,
  capacityProduction,
  onCapacityChange,
  machineries,
  onAddMachinery,
  onUpdateMachinery,
  onDeleteMachinery,
  rawMaterials,
  onAddMaterial,
  onUpdateMaterial,
  onDeleteMaterial,
  epcExecution,
  onEpcChange,
  milestones,
  onAddMilestone,
  onUpdateMilestone,
  onDeleteMilestone,
  manpower,
  onManpowerChange,
}) => {
  const [expanded, setExpanded] = useState({
    location: true,
    land: true,
    parcels: true,
    row: true,
    utilities: true,
    technical: true,
    capacity: true,
    machinery: true,
    rawMaterials: true,
    epc: true,
    milestones: true,
    manpower: true,
  });

  const toggle = (key: keyof typeof expanded) => {
    setExpanded((p) => ({ ...p, [key]: !p[key] }));
  };

  return (
    <>
      <ProjectLocationCard
        data={projectLocation}
        onChange={onLocationChange}
        isExpanded={expanded.location}
        onToggleExpand={() => toggle("location")}
      />
      <LandDetailsCard
        data={landDetails}
        onChange={onLandChange}
        isExpanded={expanded.land}
        onToggleExpand={() => toggle("land")}
      />
      <LandParcelsCard
        parcels={parcels}
        onAddParcel={onAddParcel}
        onUpdateParcel={onUpdateParcel}
        onDeleteParcel={onDeleteParcel}
        isExpanded={expanded.parcels}
        onToggleExpand={() => toggle("parcels")}
      />
      <RightOfWayCard
        data={rightOfWay}
        onChange={onRowChange}
        isExpanded={expanded.row}
        onToggleExpand={() => toggle("row")}
      />
      <UtilitiesCard
        data={utilities}
        onChange={onUtilitiesChange}
        isExpanded={expanded.utilities}
        onToggleExpand={() => toggle("utilities")}
      />
      <TechnicalDetailsCard
        data={technicalDetails}
        onChange={onTechnicalChange}
        isExpanded={expanded.technical}
        onToggleExpand={() => toggle("technical")}
      />
      <CapacityProductionCard
        data={capacityProduction}
        onChange={onCapacityChange}
        isExpanded={expanded.capacity}
        onToggleExpand={() => toggle("capacity")}
      />
      <PlantMachineryCard
        machineries={machineries}
        onAddMachinery={onAddMachinery}
        onUpdateMachinery={onUpdateMachinery}
        onDeleteMachinery={onDeleteMachinery}
        isExpanded={expanded.machinery}
        onToggleExpand={() => toggle("machinery")}
      />
      <RawMaterialInputsCard
        materials={rawMaterials}
        onAddMaterial={onAddMaterial}
        onUpdateMaterial={onUpdateMaterial}
        onDeleteMaterial={onDeleteMaterial}
        isExpanded={expanded.rawMaterials}
        onToggleExpand={() => toggle("rawMaterials")}
      />
      <EpcExecutionCard
        data={epcExecution}
        onChange={onEpcChange}
        isExpanded={expanded.epc}
        onToggleExpand={() => toggle("epc")}
      />
      <ImplementationMilestonesCard
        milestones={milestones}
        onAddMilestone={onAddMilestone}
        onUpdateMilestone={onUpdateMilestone}
        onDeleteMilestone={onDeleteMilestone}
        isExpanded={expanded.milestones}
        onToggleExpand={() => toggle("milestones")}
      />
      <ManpowerCard
        data={manpower}
        onChange={onManpowerChange}
        isExpanded={expanded.manpower}
        onToggleExpand={() => toggle("manpower")}
      />
    </>
  );
};

export default Step2LocationView;
