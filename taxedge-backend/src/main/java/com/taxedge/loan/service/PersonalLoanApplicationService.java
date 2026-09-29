package com.taxedge.loan.service;

import com.taxedge.loan.dto.PersonalLoanApplicationDto;

public interface PersonalLoanApplicationService {

    String saveApplication(PersonalLoanApplicationDto dto);

    String updateApplication(String id, PersonalLoanApplicationDto dto);

    PersonalLoanApplicationDto getApplication(String id);
}
