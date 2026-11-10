import React from "react";
import { GstFilingSelectModal } from "./GstFilingSelectModal";

interface SelectionModalsProps {
  showYearModal: boolean;
  setShowYearModal: (val: boolean) => void;
  financialYears: readonly string[];
  selectedYear?: string;
  onSelectYear: (year: string) => void;

  showPeriodModal: boolean;
  setShowPeriodModal: (val: boolean) => void;
  periodModalTitle: string;
  periods: readonly string[];
  selectedPeriod?: string;
  onSelectPeriod: (period: string) => void;

  showTypeModal: boolean;
  setShowTypeModal: (val: boolean) => void;
  returnTypes: readonly string[];
  selectedReturnType?: string;
  onSelectReturnType: (type: string) => void;
}

export const GstFilingSelectionModals: React.FC<SelectionModalsProps> = React.memo(({
  showYearModal,
  setShowYearModal,
  financialYears,
  selectedYear,
  onSelectYear,

  showPeriodModal,
  setShowPeriodModal,
  periodModalTitle,
  periods,
  selectedPeriod,
  onSelectPeriod,

  showTypeModal,
  setShowTypeModal,
  returnTypes,
  selectedReturnType,
  onSelectReturnType,
}) => (
  <>
    <GstFilingSelectModal
      visible={showYearModal}
      title="Select Financial Year"
      data={financialYears as string[]}
      selectedValue={selectedYear}
      onSelect={(item) => {
        onSelectYear(item);
        setShowYearModal(false);
      }}
      onClose={() => setShowYearModal(false)}
    />

    <GstFilingSelectModal
      visible={showPeriodModal}
      title={periodModalTitle}
      data={periods as string[]}
      selectedValue={selectedPeriod}
      onSelect={(item) => {
        onSelectPeriod(item);
        setShowPeriodModal(false);
      }}
      onClose={() => setShowPeriodModal(false)}
    />

    <GstFilingSelectModal
      visible={showTypeModal}
      title="Select Return Type"
      data={returnTypes as string[]}
      selectedValue={selectedReturnType}
      numberOfLines={2}
      onSelect={(item) => {
        onSelectReturnType(item);
        setShowTypeModal(false);
      }}
      onClose={() => setShowTypeModal(false)}
    />
  </>
));
GstFilingSelectionModals.displayName = "GstFilingSelectionModals";
