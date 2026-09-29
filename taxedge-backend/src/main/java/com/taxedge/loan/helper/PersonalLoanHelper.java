package com.taxedge.loan.helper;

import java.util.Locale;
import java.util.UUID;

public class PersonalLoanHelper {

    private PersonalLoanHelper() {}

    public static String generateLoanApplicationId() {
        return "PLN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
    }
}
