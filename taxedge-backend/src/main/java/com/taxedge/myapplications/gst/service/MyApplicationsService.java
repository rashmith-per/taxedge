package com.taxedge.myapplications.gst.service;

import java.util.List;

import com.taxedge.myapplications.gst.dto.MyApplicationResponseDto;

public interface MyApplicationsService {

    List<MyApplicationResponseDto> getMyApplications(String custId);
}
