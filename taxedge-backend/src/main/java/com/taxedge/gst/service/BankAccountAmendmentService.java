package com.taxedge.gst.service;

import com.taxedge.gst.dto.BankAccountAmendmentViewDto;
import com.taxedge.gst.enums.AccountType;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface BankAccountAmendmentService {

    BankAccountAmendmentViewDto getExistingBankAccountDetails(String gstId);

    String submitBankAccountAmendment(String gstId, String bankName, String accountNumber,
                                      String ifscCode, AccountType accountType, MultipartFile file) throws IOException;
}
