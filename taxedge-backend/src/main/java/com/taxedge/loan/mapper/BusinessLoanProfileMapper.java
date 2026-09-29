package com.taxedge.loan.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.taxedge.loan.dto.BusinessLoanProfileDto;
import com.taxedge.loan.entity.BusinessLoanProfile;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.WARN)
public interface BusinessLoanProfileMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "loanApplication", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    BusinessLoanProfile toEntity(BusinessLoanProfileDto dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "loanApplication", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateFromDto(BusinessLoanProfileDto dto, @MappingTarget BusinessLoanProfile entity);

    @Mapping(target = "loanApplicationId", source = "loanApplication.id")
    BusinessLoanProfileDto toDto(BusinessLoanProfile entity);
}