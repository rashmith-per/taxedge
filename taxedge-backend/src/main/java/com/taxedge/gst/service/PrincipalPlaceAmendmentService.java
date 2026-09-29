package com.taxedge.gst.service;

import com.taxedge.gst.dto.PrincipalPlaceAmendmentViewDto;
import com.taxedge.gst.enums.NatureOfPremises;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface PrincipalPlaceAmendmentService {
    
    PrincipalPlaceAmendmentViewDto getExistingPrincipalPlaceDetails(String gstId);

    String submitAmendment(String gstId, String address, String city, String district,
                           String state, String pinCode, NatureOfPremises natureOfPremises,
                           MultipartFile file) throws IOException;
}
