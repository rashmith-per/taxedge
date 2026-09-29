package com.taxedge.gst.service;

import com.taxedge.gst.dto.SignatoryAmendmentViewDto;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.time.LocalDate;

public interface SignatoryAmendmentService {

    SignatoryAmendmentViewDto getExistingSignatoryDetails(String gstId);

    String submitSignatoryAmendment(String gstId, String signatoryName, String signatoryPan,
                                    LocalDate signatoryDob, String designation, String signatoryMobile,
                                    String signatoryEmail, MultipartFile file) throws IOException;
}
