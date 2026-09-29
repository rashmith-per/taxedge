package com.taxedge.gst.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.taxedge.gst.enums.NatureOfPremises;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PrincipalPlaceAmendmentViewDto {

    private String newBusinessAddress;
    private String newCity;
    private String newDistrict;
    private String newState;
    private String newPinCode;
    private NatureOfPremises natureOfPremises;
    private String imageData;
}
