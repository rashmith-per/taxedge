package com.taxedge.loan.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.taxedge.loan.dto.BusinessLoanApplicationDto;
import com.taxedge.loan.entity.BusinessLoanApplication;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.WARN)
public interface BusinessLoanApplicationMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    BusinessLoanApplication toEntity(BusinessLoanApplicationDto dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateFromDto(BusinessLoanApplicationDto dto,
                       @MappingTarget BusinessLoanApplication entity);

    @Mapping(target = "custId", source = "customer.custId")
    BusinessLoanApplicationDto toDto(BusinessLoanApplication entity);
}