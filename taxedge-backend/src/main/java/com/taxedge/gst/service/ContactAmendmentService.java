package com.taxedge.gst.service;

import com.taxedge.gst.dto.ContactAmendmentViewDto;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface ContactAmendmentService {
    ContactAmendmentViewDto getExistingContactDetails(String gstId);
    String submitContactAmendment(String gstId, String mobileNumber, String email, MultipartFile file) throws IOException;
}
