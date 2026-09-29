package com.taxedge.gst.service;

import com.taxedge.gst.dto.LegalNameAmendmentViewDto;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface LegalNameAmendmentService {

    LegalNameAmendmentViewDto getExistingLegalNameDetails(String gstId);

    String submitLegalNameAmendment(String gstId, String newLegalName, MultipartFile file) throws IOException;
}
