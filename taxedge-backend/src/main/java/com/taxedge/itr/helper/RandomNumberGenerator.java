package com.taxedge.itr.helper;

import java.util.Random;

public class RandomNumberGenerator {

    private static final Random random = new Random();

    public static String generateItrId() {

        int number = random.nextInt(1_000_000);

        return String.format("ITR%06d", number);
    }
    
    
    
    public static String generateIncomeId() {
        int number = random.nextInt(1_000_000);
        return String.format("INM%06d", number);
    }
    
    public static String generateDocumentId() {
        int number = random.nextInt(1_000_000);
        return String.format("DOC%06d", number);
    }
    
    public static String generateRevisedItrId() {
        int number = random.nextInt(1_000_000);
        return String.format("RITR%06d", number);
    }
    
    public static String generateRevisionReasonId() {
        int number = random.nextInt(1_000_000);
        return String.format("RR%06d", number);
    }
    
    public static String generateRevisedItrDetailsId() {
        int number = random.nextInt(1_000_000);
        return String.format("RID%06d", number);
    }
    
    public static String generateRevisedItrDocumentId() {
        int number = random.nextInt(1_000_000);
        return String.format("RID%06d", number);
    }
    
    public static String generateTaxNoticeId() {
        int number = random.nextInt(1_000_000);
        return String.format("TNA%06d", number);
    }
    
    public static String generateTaxNoticeDocumentId() {
        int number = random.nextInt(1_000_000);
        return String.format("TND%06d", number);
    }
    
    
    public static String generateTdsRefundId() {
        int number = random.nextInt(1_000_000);
        return String.format("TDS%06d", number);
    }
}