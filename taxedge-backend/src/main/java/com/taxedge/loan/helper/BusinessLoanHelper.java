package com.taxedge.loan.helper;

import java.security.SecureRandom;

public class BusinessLoanHelper {

    private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    public static String generateLoanApplicationId() {
        StringBuilder sb = new StringBuilder("BLN-");
        for (int i = 0; i < 8; i++) {
            sb.append(ALPHABET.charAt(RANDOM.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }
}