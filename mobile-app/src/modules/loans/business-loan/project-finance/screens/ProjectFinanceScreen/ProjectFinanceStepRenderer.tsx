import React from "react";
import {
  Step1ApplicantView,
  Step2LocationView,
  Step3CostFundingView,
  Step4MarketFinancialsView,
  Step5LoanRequirementView,
  Step6SecurityComplianceView,
  Step7DocumentsSubmitView,
} from "../../components/steps";
import { useProjectFinanceState } from "./useProjectFinanceState";

interface ProjectFinanceStepRendererProps {
  currentStepIndex: number;
  state: ReturnType<typeof useProjectFinanceState>;
  setCurrentStepIndex: (index: number) => void;
}

export const ProjectFinanceStepRenderer: React.FC<
  ProjectFinanceStepRendererProps
> = ({ currentStepIndex, state, setCurrentStepIndex }) => {
  switch (currentStepIndex) {
    case 0:
      return (
        <Step1ApplicantView
          applicantDetails={state.applicantDetails}
          onApplicantChange={(f, v) => state.setApplicantDetails((p) => ({ ...p, [f]: v }))}
          registeredAddress={state.registeredAddress}
          onAddressChange={(f, v) => state.setRegisteredAddress((p) => ({ ...p, [f]: v }))}
          promoters={state.promoters}
          onAddPromoter={(i) => state.setPromoters((p) => [...p, i])}
          onUpdatePromoter={(i) => state.setPromoters((p) => p.map((x) => (x.id === i.id ? i : x)))}
          projectClassification={state.projectClassification}
          onClassificationChange={(f, v) => state.setProjectClassification((p) => ({ ...p, [f]: v }))}
        />
      );

    case 1:
      return (
        <Step2LocationView
          projectLocation={state.projectLocation}
          onLocationChange={(f, v) => state.setProjectLocation((p) => ({ ...p, [f]: v }))}
          landDetails={state.landDetails}
          onLandChange={(f, v) => state.setLandDetails((p) => ({ ...p, [f]: v }))}
          parcels={state.parcels}
          onAddParcel={() =>
            state.setParcels((p) => [
              ...p,
              { id: Date.now().toString(), surveyPlotNumber: "", areaAcres: "", ownership: "", acquisitionStatus: "", titleStatus: "", encumbrance: "" },
            ])
          }
          onUpdateParcel={(id, f, v) => state.setParcels((p) => p.map((x) => (x.id === id ? { ...x, [f]: v } : x)))}
          onDeleteParcel={(id) => state.setParcels((p) => p.filter((x) => x.id !== id))}
          rightOfWay={state.rightOfWay}
          onRowChange={(f, v) => state.setRightOfWay((p) => ({ ...p, [f]: v }))}
          utilities={state.utilities}
          onUtilitiesChange={(f, v) => state.setUtilities((p) => ({ ...p, [f]: v }))}
          technicalDetails={state.technicalDetails}
          onTechnicalChange={(f, v) => state.setTechnicalDetails((p) => ({ ...p, [f]: v }))}
          capacityProduction={state.capacityProduction}
          onCapacityChange={(f, v) => state.setCapacityProduction((p) => ({ ...p, [f]: v }))}
          machineries={state.machineries}
          onAddMachinery={() =>
            state.setMachineries((p) => [
              ...p,
              { id: Date.now().toString(), machineryName: "", category: "", manufacturerSupplier: "", quantity: "", unitCost: "", totalCost: "" },
            ])
          }
          onUpdateMachinery={(id, f, v) => state.setMachineries((p) => p.map((x) => (x.id === id ? { ...x, [f]: v } : x)))}
          onDeleteMachinery={(id) => state.setMachineries((p) => p.filter((x) => x.id !== id))}
          rawMaterials={state.rawMaterials}
          onAddMaterial={() =>
            state.setRawMaterials((p) => [
              ...p,
              { id: Date.now().toString(), mainRawMaterial: "", source: "", supplier: "", annualRequirement: "", unit: "", supplyAgreement: false },
            ])
          }
          onUpdateMaterial={(id, f, v) => state.setRawMaterials((p) => p.map((x) => (x.id === id ? { ...x, [f]: v } : x)))}
          onDeleteMaterial={(id) => state.setRawMaterials((p) => p.filter((x) => x.id !== id))}
          epcExecution={state.epcExecution}
          onEpcChange={(f, v) => state.setEpcExecution((p) => ({ ...p, [f]: v }))}
          milestones={state.milestones}
          onAddMilestone={() =>
            state.setMilestones((p) => [
              ...p,
              { id: Date.now().toString(), milestone: "", plannedDate: "", actualDate: "", status: "Planned" },
            ])
          }
          onUpdateMilestone={(id, f, v) => state.setMilestones((p) => p.map((x) => (x.id === id ? { ...x, [f]: v } : x)))}
          onDeleteMilestone={(id) => state.setMilestones((p) => p.filter((x) => x.id !== id))}
          manpower={state.manpower}
          onManpowerChange={(f, v) => state.setManpower((p) => ({ ...p, [f]: v }))}
        />
      );

    case 2:
      return (
        <Step3CostFundingView
          projectCost={state.projectCost}
          onCostChange={(f, v) => state.setProjectCost((p) => ({ ...p, [f]: v }))}
          meansOfFinance={state.meansOfFinance}
          onMeansChange={(f, v) => state.setMeansOfFinance((p) => ({ ...p, [f]: v }))}
          disbursementSchedule={state.disbursementSchedule}
          onScheduleChange={(f, v) => state.setDisbursementSchedule((p) => ({ ...p, [f]: v }))}
        />
      );

    case 3:
      return (
        <Step4MarketFinancialsView
          products={state.products}
          onAddProduct={() =>
            state.setProducts((p) => [
              ...p,
              {
                id: Date.now().toString(),
                name: "",
                category: "",
                unit: "",
                installedCapacity: "",
                expectedProductionAnnual: "",
                capacityUtilisation: "",
                sellingPrice: "",
                domesticExport: "",
                productMix: "",
              },
            ])
          }
          onUpdateProduct={(id, field, value) =>
            state.setProducts((p) =>
              p.map((x) => (x.id === id ? { ...x, [field]: value } : x))
            )
          }
          onDeleteProduct={(id) => state.setProducts((p) => p.filter((x) => x.id !== id))}
          marketDetails={state.marketDetails}
          onMarketChange={(f, v) => state.setMarketDetails((p) => ({ ...p, [f]: v }))}
          customers={state.customers}
          onAddCustomer={() =>
            state.setCustomers((p) => [
              ...p,
              {
                id: Date.now().toString(),
                customerName: "",
                customerType: "",
                expectedPurchaseQty: "",
                unit: "",
                expectedRevenue: "",
                contractAvailable: true,
                contractPeriodYears: "",
                contractedPrice: "",
                minimumOfftake: "",
                agreementStatus: "",
              },
            ])
          }
          onUpdateCustomer={(id, field, value) =>
            state.setCustomers((p) =>
              p.map((x) => (x.id === id ? { ...x, [field]: value } : x))
            )
          }
          onDeleteCustomer={(id) => state.setCustomers((p) => p.filter((x) => x.id !== id))}
          projectionSetup={state.projectionSetup}
          onProjectionSetupChange={(f, v) => state.setProjectionSetup((p) => ({ ...p, [f]: v }))}
          historicalFinancials={state.historicalFinancials}
          onHistoricalChange={(row, f, v) =>
            state.setHistoricalFinancials((p) => ({
              ...p,
              [row]: { ...p[row], [f]: v },
            }))
          }
          projectedFinancials={state.projectedFinancials}
          cashFlow={state.cashFlow}
          workingCapital={state.workingCapital}
          onWorkingCapitalChange={(f, v) => state.setWorkingCapital((p) => ({ ...p, [f]: v }))}
          debtServiceDscr={state.debtServiceDscr}
          financialRatios={state.financialRatios}
          sensitivityScenarios={state.sensitivityScenarios}
        />
      );

    case 4:
      return (
        <Step5LoanRequirementView
          loanRequirement={state.loanRequirement}
          onRequirementChange={(f, v) => state.setLoanRequirement((p) => ({ ...p, [f]: v }))}
          repaymentDetails={state.repaymentDetails}
          onRepaymentChange={(f, v) => state.setRepaymentDetails((p) => ({ ...p, [f]: v }))}
          repaymentSchedule={state.repaymentSchedule}
          repaymentSources={state.repaymentSources}
          onSourcesChange={(f, v) => state.setRepaymentSources((p) => ({ ...p, [f]: v }))}
          sensitivityRisk={state.sensitivityRisk}
          onRiskChange={(f, v) => state.setSensitivityRisk((p) => ({ ...p, [f]: v }))}
          totalProjectCostFromScreen3={state.projectCost.totalProjectCost}
          ownContributionFromScreen3={state.meansOfFinance.promotersEquity}
        />
      );

    case 5:
      return (
        <Step6SecurityComplianceView
          securities={state.securities}
          onAddSecurity={() =>
            state.setSecurities((p) => [
              ...p,
              {
                id: Date.now().toString(),
                typeOfSecurity: "",
                assetDescription: "",
                estimatedValue: "",
                ownershipType: "",
                locationOfAsset: "",
                valuationReportAvailable: true,
                anyExistingCharge: false,
                existingChargeDetails: "",
              },
            ])
          }
          onUpdateSecurity={(id, f, v) => state.setSecurities((p) => p.map((x) => (x.id === id ? { ...x, [f]: v } : x)))}
          onDeleteSecurity={(id) => state.setSecurities((p) => p.filter((x) => x.id !== id))}
          legalApprovals={state.legalApprovals}
          onLegalApprovalsChange={(f, v) => state.setLegalApprovals((p) => ({ ...p, [f]: v }))}
          regulatoryCompliance={state.regulatoryCompliance}
          onRegulatoryChange={(f, v) => state.setRegulatoryCompliance((p) => ({ ...p, [f]: v }))}
          insuranceDetails={state.insuranceDetails}
          onInsuranceChange={(f, v) => state.setInsuranceDetails((p) => ({ ...p, [f]: v }))}
          otherCompliance={state.otherCompliance}
          onOtherComplianceChange={(f, v) => state.setOtherCompliance((p) => ({ ...p, [f]: v }))}
        />
      );

    case 6:
      return (
        <Step7DocumentsSubmitView
          documents={state.documents}
          onUploadDocument={(id, file) =>
            state.setDocuments((prev) =>
              prev.map((d) =>
                d.id === id
                  ? {
                      ...d,
                      uploadedFileName: file.name,
                      uploadedFileUri: file.uri,
                      uploadedFileSize: file.size,
                      uploadedAt: new Date().toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }),
                    }
                  : d
              )
            )
          }
          onDeleteDocument={(id) =>
            state.setDocuments((prev) =>
              prev.map((d) =>
                d.id === id
                  ? {
                      ...d,
                      uploadedFileName: undefined,
                      uploadedFileUri: undefined,
                      uploadedFileSize: undefined,
                      uploadedAt: undefined,
                    }
                  : d
              )
            )
          }
          onEditStep={(stepIdx) => setCurrentStepIndex(stepIdx)}
          agreeAccuracy={state.agreeAccuracy}
          onToggleAgreeAccuracy={() => state.setAgreeAccuracy((p) => !p)}
          agreeVerification={state.agreeVerification}
          onToggleAgreeVerification={() => state.setAgreeVerification((p) => !p)}
        />
      );

    default:
      return null;
  }
};

export default ProjectFinanceStepRenderer;
