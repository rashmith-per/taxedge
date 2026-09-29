package com.taxedge.itr.service;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import com.taxedge.itr.Exception.ResourceNotFoundException;
import com.taxedge.itr.dto.SalaryIncomeDto;
import com.taxedge.itr.entity.ItrFiling;
import com.taxedge.itr.entity.SalaryIncome;
import com.taxedge.itr.helper.RandomNumberGenerator;
import com.taxedge.itr.repository.ItrFilingRepository;
import com.taxedge.itr.repository.SalaryIncomeRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class SalaryIncomeServiceImpl implements SalaryIncomeService {

	
	private final  SalaryIncomeRepository salaryIncomeRepository;

	
	private final ItrFilingRepository itrFilingRepository;

	@Autowired
	@Qualifier("itrModelMapper")
	private ModelMapper modelMapper;

	@Override
	public String registerSalaryIncome(String itrId, SalaryIncomeDto salaryIncomeDto) {

		ItrFiling itrFiling = itrFilingRepository.findById(itrId)
				.orElseThrow(() -> new ResourceNotFoundException("ITR Filing not found with itrId: " + itrId));

		validateIncome(salaryIncomeDto);

		SalaryIncome salaryIncome = modelMapper.map(salaryIncomeDto, SalaryIncome.class);

		salaryIncome.setItrFiling(itrFiling);

		String incomeId = RandomNumberGenerator.generateIncomeId();

		salaryIncome.setIncomeId(incomeId);

		salaryIncomeRepository.save(salaryIncome);

		return "Income details registered successfully. Income ID: " + incomeId;
	}

	@Override
	public SalaryIncomeDto getSalaryIncome(String incomeId) {

		SalaryIncome salaryIncome = salaryIncomeRepository.findById(incomeId)
				.orElseThrow(() -> new ResourceNotFoundException("Salary income not found with incomeId: " + incomeId));

		return modelMapper.map(salaryIncome, SalaryIncomeDto.class);
	}

	@Override
	public String updateSalaryIncome(String incomeId, SalaryIncomeDto salaryIncomeDto) {

		SalaryIncome salaryIncome = salaryIncomeRepository.findById(incomeId)
				.orElseThrow(() -> new ResourceNotFoundException("Salary income not found with incomeId: " + incomeId));

		validateIncome(salaryIncomeDto);

		modelMapper.map(salaryIncomeDto, salaryIncome);

		salaryIncome.setIncomeId(incomeId);

		salaryIncomeRepository.save(salaryIncome);

		return "Income details updated successfully";
	}

	@Override
	public String deleteSalaryIncome(String incomeId) {

		SalaryIncome salaryIncome = salaryIncomeRepository.findById(incomeId)
				.orElseThrow(() -> new ResourceNotFoundException("Salary income not found with incomeId: " + incomeId));

		salaryIncomeRepository.delete(salaryIncome);

		return "Income details deleted successfully";
	}

	private void validateIncome(SalaryIncomeDto dto) {

		if (dto.getIncomeSource() == null || dto.getIncomeSource().trim().isEmpty()) {

			throw new IllegalArgumentException("Income source is required");
		}

		// Salary / Pension

		if (dto.getIncomeSource().equalsIgnoreCase("Salary / Pension")) {

			if (dto.getEmployerLegalName() == null || dto.getEmployerLegalName().trim().isEmpty()
					|| dto.getGrossSalary() == null || dto.getGrossSalary().trim().isEmpty()
					|| dto.getExemptAllowances() == null || dto.getExemptAllowances().trim().isEmpty()
					|| dto.getTdsDeductedByEmployer() == null || dto.getTdsDeductedByEmployer().trim().isEmpty()) {

				throw new IllegalArgumentException(
						"Employer legal name, gross salary, exempt allowances and TDS deducted by employer are required");
			}
		}

		// House Property

		else if (dto.getIncomeSource().equalsIgnoreCase("House Property")) {

			if (dto.getPropertyClassification() == null) {

				throw new IllegalArgumentException("Property classification is required");
			}

			if (dto.getPropertyClassification().name().equals("SELF_OCCUPIED")) {

				if (dto.getHomeLoanInterestPaid() == null || dto.getHomeLoanInterestPaid().trim().isEmpty()) {

					throw new IllegalArgumentException("Home loan interest paid is required");
				}
			}

			else if (dto.getPropertyClassification().name().equals("LET_OUT_RENTED")) {

				if (dto.getAnnualRentReceived() == null || dto.getAnnualRentReceived().trim().isEmpty()
						|| dto.getMunicipalTaxesPaid() == null || dto.getMunicipalTaxesPaid().trim().isEmpty()
						|| dto.getHomeLoanInterestPaid() == null || dto.getHomeLoanInterestPaid().trim().isEmpty()) {

					throw new IllegalArgumentException(
							"Annual rent received, municipal taxes paid and home loan interest paid are required");
				}
			}
		}

		// Business / Profession

		else if (dto.getIncomeSource().equalsIgnoreCase("Business / Profession")) {

			if (dto.getHowDoYouReportThisBusiness() == null || dto.getHowDoYouReportThisBusiness().trim().isEmpty()
					|| dto.getGrossTurnover() == null || dto.getGrossTurnover().trim().isEmpty()
					|| dto.getDeclaredNetProfit() == null || dto.getDeclaredNetProfit().trim().isEmpty()) {

				throw new IllegalArgumentException(
						"Business reporting method, gross turnover and declared net profit are required");
			}
		}

		// Capital Gains

		else if (dto.getIncomeSource().equalsIgnoreCase("Capital Gains")) {

			if (dto.getAssetType() == null || dto.getShortTermGains() == null
					|| dto.getShortTermGains().trim().isEmpty() || dto.getLongTermGains() == null
					|| dto.getLongTermGains().trim().isEmpty()) {

				throw new IllegalArgumentException("Asset type, short term gains and long term gains are required");
			}
		}

		// Other Sources

		else if (dto.getIncomeSource().equalsIgnoreCase("Other Sources")) {

			if ((dto.getSavingsInterest() == null || dto.getSavingsInterest().trim().isEmpty())
					&& (dto.getFdTermInterest() == null || dto.getFdTermInterest().trim().isEmpty())
					&& (dto.getDividendIncome() == null || dto.getDividendIncome().trim().isEmpty())
					&& (dto.getOtherMiscellaneous() == null || dto.getOtherMiscellaneous().trim().isEmpty())) {

				throw new IllegalArgumentException("At least one other source income is required");
			}
		}
	}
}