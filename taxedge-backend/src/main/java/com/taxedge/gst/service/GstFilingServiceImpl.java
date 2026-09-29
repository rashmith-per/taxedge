package com.taxedge.gst.service;

import java.time.LocalDateTime;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.taxedge.gst.dto.GstFilingDto;
import com.taxedge.gst.entity.GstFiling;
import com.taxedge.gst.enums.FilingType;
import com.taxedge.gst.enums.TaxCalculationMethod;
import com.taxedge.gst.exception.ResourceNotFoundException;
import com.taxedge.gst.helper.RandomNumberGenerator;
import com.taxedge.gst.repository.GstFilingRepository;

@Service
@RequiredArgsConstructor
public class GstFilingServiceImpl implements GstFilingService {

    private final GstFilingRepository gstFilingRepository;
    private final ModelMapper modelMapper;

    @Override
    public String createFiling(GstFilingDto gstFilingDto) {

        validateFiling(gstFilingDto);

        GstFiling filing =
                modelMapper.map(
                        gstFilingDto,
                        GstFiling.class);

        filing.setId(
                RandomNumberGenerator.generateFilingId());

        filing.setGstin(
                gstFilingDto.getGstin());
        filing.setCreatedAt(
                LocalDateTime.now());

        gstFilingRepository.save(filing);

        return "GST filing created successfully";
    }

    @Override
    public List<GstFiling> getFilingsByGstin(
            String gstin) {

        return gstFilingRepository.findByGstin(gstin);
    }

    @Override
    public String updateFiling(
            String id,
            GstFilingDto gstFilingDto) {

        GstFiling filing =
                gstFilingRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "GST filing not found with id: "
                                                + id));

        if (!filing.getGstin()
                .equals(gstFilingDto.getGstin())) {

            throw new ResourceNotFoundException(
                    "GST filing does not belong to GSTIN: "
                            + gstFilingDto.getGstin());
        }

        validateFiling(gstFilingDto);

        modelMapper.typeMap(
                GstFilingDto.class,
                GstFiling.class)
                .addMappings(mapper ->
                        mapper.skip(GstFiling::setId));

        modelMapper.map(
                gstFilingDto,
                filing);

        filing.setId(id);

        filing.setGstin(
                gstFilingDto.getGstin());

        gstFilingRepository.save(filing);

        return "GST filing updated successfully";
    }

    @Override
    public String deleteFiling(String id) {

        GstFiling filing =
                gstFilingRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "GST filing not found with id: "
                                                + id));

        gstFilingRepository.delete(filing);

        return "GST filing deleted successfully";
    }

    private void validateFiling(
            GstFilingDto dto) {

        if (dto.getGstin() == null ||
                dto.getGstin().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "GSTIN is required");
        }

        if (dto.getFinancialYear() == null ||
                dto.getFinancialYear().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Financial year is required");
        }

        if (dto.getFilingPeriod() == null ||
                dto.getFilingPeriod().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Filing period is required");
        }

        if (dto.getFilingFrequency() == null) {

            throw new IllegalArgumentException(
                    "Filing frequency is required");
        }

        if (dto.getReturnType() == null) {

            throw new IllegalArgumentException(
                    "Return type is required");
        }

        if (dto.getFilingType() == null) {

            throw new IllegalArgumentException(
                    "Filing type is required");
        }

        if (dto.getFilingType() ==
                FilingType.NIL_RETURN) {

            dto.setTaxCalculationMethod(null);
            dto.setEstimatedTaxableSales(null);
            dto.setEstimatedTaxablePurchases(null);
            dto.setEstimatedEligibleItc(null);

            return;
        }

        if (dto.getFilingType() ==
                FilingType.REGULAR) {

            if (dto.getTaxCalculationMethod() == null) {

                throw new IllegalArgumentException(
                        "Tax calculation method is required for regular filing");
            }

            if (dto.getTaxCalculationMethod() ==
                    TaxCalculationMethod.ESTIMATION_FIGURES) {

                if (dto.getEstimatedTaxableSales() == null) {

                    throw new IllegalArgumentException(
                            "Estimated taxable sales is required");
                }

                if (dto.getEstimatedTaxablePurchases() == null) {

                    throw new IllegalArgumentException(
                            "Estimated taxable purchases is required");
                }

                if (dto.getEstimatedEligibleItc() == null) {

                    throw new IllegalArgumentException(
                            "Estimated eligible ITC is required");
                }

                if (dto.getEstimatedTaxableSales() < 0) {

                    throw new IllegalArgumentException(
                            "Estimated taxable sales cannot be negative");
                }

                if (dto.getEstimatedTaxablePurchases() < 0) {

                    throw new IllegalArgumentException(
                            "Estimated taxable purchases cannot be negative");
                }

                if (dto.getEstimatedEligibleItc() < 0) {

                    throw new IllegalArgumentException(
                            "Estimated eligible ITC cannot be negative");
                }

            } else if (dto.getTaxCalculationMethod() ==
                    TaxCalculationMethod.TAXEDGE_CA_CALCULATION) {

                dto.setEstimatedTaxableSales(null);
                dto.setEstimatedTaxablePurchases(null);
                dto.setEstimatedEligibleItc(null);
            }
        }
    }
}