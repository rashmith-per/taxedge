import React from "react";
import { View } from "react-native";
import { FormInput } from "../../../../shared/components/Input/FormInput";
import type { CompanyDetails } from "../../types/company.types";
import { styles } from "./CompanyDetailsForm.styles";

export interface CompanyDetailsFormProps {
  values: Partial<CompanyDetails>;
  onChange: (updates: Partial<CompanyDetails>) => void;
}

export const CompanyDetailsForm: React.FC<CompanyDetailsFormProps> = ({
  values,
  onChange,
}) => {
  return (
    <View style={styles.container}>
      <FormInput
        label="Proposed Company Name (Option 1)"
        value={values.proposedName1 || ""}
        onChangeText={(text) => onChange({ proposedName1: text })}
        placeholder="Enter Proposed Company Name (Option 1)"
        required
      />
      <FormInput
        label="Proposed Company Name (Option 2 - Alternative)"
        value={values.proposedName2 || ""}
        onChangeText={(text) => onChange({ proposedName2: text })}
        placeholder="Enter Proposed Company Name (Option 2)"
      />
      <FormInput
        label="Industry Category"
        value={values.industryCategory || ""}
        onChangeText={(text) => onChange({ industryCategory: text })}
        placeholder="Enter Industry Category"
        required
      />
      <FormInput
        label="Business Activity Description"
        value={values.businessActivityDescription || ""}
        onChangeText={(text) => onChange({ businessActivityDescription: text })}
        placeholder="Enter Business Activity Description"
        required
      />
    </View>
  );
};

export default CompanyDetailsForm;
