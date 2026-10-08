import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { ServiceHeader } from "../../../../shared/components/ServiceHeader";
import { ServiceList } from "../../../../shared/components/ServiceList";
import { useServiceAccessGuard } from "../../../../shared/hooks";
import { loansService } from "../../services/LoansService";
import { LoanServiceItem } from "../../types/loans.types";
import { styles } from "./LoansScreen.styles";
import { toHref } from "@/shared/utils/navigation";

export const LoansScreen: React.FC = () => {
  const router = useRouter();
  const { accessService } = useServiceAccessGuard();
  const [services, setServices] = useState<LoanServiceItem[]>([]);

  useEffect(() => {
    loansService.fetchLoanServices().then(setServices);
  }, []);

  const handleCardPress = (item: LoanServiceItem) => {
    if (item.route) {
      accessService(toHref(item.route));
    }
  };

  return (
    <View style={styles.container}>
      <ServiceHeader
        title="Loan Marketplace & Assistance"
        
        tag="Capital & Financing"
        iconName="wallet"
      />
      <ServiceList items={services} onItemPress={handleCardPress} />
    </View>
  );
};

export default LoansScreen;
