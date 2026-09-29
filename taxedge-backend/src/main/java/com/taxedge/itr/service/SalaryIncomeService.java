package com.taxedge.itr.service;

import com.taxedge.itr.dto.SalaryIncomeDto;

public interface SalaryIncomeService {

	String registerSalaryIncome(String itrId, SalaryIncomeDto salaryIncomeDto);

	SalaryIncomeDto getSalaryIncome(String incomeId);

	String updateSalaryIncome(String incomeId, SalaryIncomeDto salaryIncomeDto);

	String deleteSalaryIncome(String incomeId);
}