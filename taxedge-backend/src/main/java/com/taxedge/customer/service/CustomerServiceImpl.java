package com.taxedge.customer.service;

import java.time.LocalDateTime;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.taxedge.customer.dto.CustomerDto;
import com.taxedge.customer.dto.LoginRequest;
import com.taxedge.customer.dto.UpdatePasswordDto;
import com.taxedge.customer.entity.Customer;
import com.taxedge.customer.exception.CustomerNotFoundException;
import com.taxedge.customer.exception.DuplicateResourceException;
import com.taxedge.customer.exception.InvalidCredentialsException;
import com.taxedge.customer.helper.CustomerHelper;
import com.taxedge.customer.mapper.CustomerMapper;
import com.taxedge.customer.repository.CustomerRepository;
import com.taxedge.notification.service.FcmNotificationService;
import com.taxedge.security.jwt.CustomerJwt;
import com.taxedge.security.jwt.service.JwtService;
import com.taxedge.security.jwt.service.RefreshTokenService;

import jakarta.transaction.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerMapper customerMapper;
	private final FcmNotificationService fcmNotificationService;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @Override
    @Transactional
    public CustomerJwt registerCustomer(CustomerDto customerDto) {

        validateUniqueFields(customerDto);

        Customer customer = customerMapper.toEntity(customerDto);
        customer.setCustId(CustomerHelper.generateCustomerId());
        customer.setPassword(passwordEncoder.encode(customerDto.getPassword()));
        customer.setCreatedAt(LocalDateTime.now());

        Customer savedCustomer = customerRepository.save(customer);
        
        if (savedCustomer.getPushToken() != null && !savedCustomer.getPushToken().isBlank()) {
            fcmNotificationService.sendRegistrationSuccessNotification(
                    savedCustomer.getPushToken(),
                    savedCustomer.getName()
            );
        }

        String accessToken = jwtService.generateToken(
                savedCustomer.getCustId(),
                savedCustomer.getName(),
                savedCustomer.getMobileNumber()
        );

        String refreshToken = refreshTokenService.createRefreshToken(savedCustomer);

        return new CustomerJwt(
                accessToken,
                refreshToken,
                savedCustomer.getCustId(),
                savedCustomer.getName(),
                savedCustomer.getMobileNumber()
        );
    }

  
    private void validateUniqueFields(CustomerDto dto) {

        if (isPresent(dto.getMobileNumber()) && customerRepository.existsByMobileNumber(dto.getMobileNumber().trim())) {
            throw new DuplicateResourceException("mobileNumber", "Mobile number already registered");
        }

        if (isPresent(dto.getEmail()) && customerRepository.existsByEmail(dto.getEmail().trim())) {
            throw new DuplicateResourceException("email", "Email already registered");
        }

        if (isPresent(dto.getAadhaar()) && customerRepository.existsByAadhaar(dto.getAadhaar().trim())) {
            throw new DuplicateResourceException("aadhaar", "Aadhaar already registered");
        }

        if (isPresent(dto.getPan()) && customerRepository.existsByPan(dto.getPan().trim())) {
            throw new DuplicateResourceException("pan", "PAN already registered");
        }
    }

    private boolean isPresent(String value) {
        return value != null && !value.isBlank();
    }


    @Override
    public CustomerJwt loginCustomer(LoginRequest loginRequest) {
        Customer customer = customerRepository.findByMobileNumber(loginRequest.getMobileNumber())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid mobile number or password"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), customer.getPassword())) {
            throw new InvalidCredentialsException("Invalid mobile number or password");
        }

        String accessToken = jwtService.generateToken(
                customer.getCustId(),
                customer.getName(),
                customer.getMobileNumber()
        );

        String refreshToken = refreshTokenService.createRefreshToken(customer);

        log.info("🔑 [LOGIN SUCCESS] Access token for user ({} / {}): {}", customer.getCustId(), customer.getMobileNumber(), accessToken);

        return new CustomerJwt(
                accessToken,
                refreshToken,
                customer.getCustId(),
                customer.getName(),
                customer.getMobileNumber()
        );
    }


    @Override
    @Transactional
    public String updatePassword(UpdatePasswordDto updatePasswordDto) {
        String mobileNumber = updatePasswordDto.getMobileNumber() != null 
                ? updatePasswordDto.getMobileNumber().trim() 
                : "";

        Customer customer = customerRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new InvalidCredentialsException("Customer not found"));

        customer.setPassword(passwordEncoder.encode(updatePasswordDto.getPassword()));
        customerRepository.save(customer);

        return "Password updated successfully";
    }

    @Override
    public boolean existsByMobileNumber(String mobileNumber) {
        return mobileNumber != null && customerRepository.existsByMobileNumber(mobileNumber.trim());
    }


	@Override
	public CustomerDto getDetails(String custId) {
		Customer customer = (custId != null && !custId.isBlank())
				? customerRepository.findById(custId).orElse(null)
				: null;

		if (customer == null && custId != null && !custId.isBlank()) {
			customer = customerRepository.findByMobileNumber(custId.trim()).orElse(null);
		}

		if (customer == null) {
			throw new CustomerNotFoundException("Customer not found with id or mobile: " + custId);
		}

		return customerMapper.toDto(customer);
	}


	@Override
	@Transactional
	public String updateCustomer(CustomerDto dto) {
		Customer customer = (dto.getCustId() != null && !dto.getCustId().isBlank())
				? customerRepository.findById(dto.getCustId()).orElse(null)
				: null;

		if (customer == null && dto.getMobileNumber() != null && !dto.getMobileNumber().isBlank()) {
			customer = customerRepository.findByMobileNumber(dto.getMobileNumber().trim()).orElse(null);
		}

		if (customer == null) {
			String identifier = (dto.getCustId() != null && !dto.getCustId().isBlank())
					? dto.getCustId()
					: dto.getMobileNumber();
			throw new CustomerNotFoundException("Customer not found with id or mobile: " + identifier);
		}

		customerMapper.updateCustomerFromDto(dto, customer);

		customerRepository.save(customer);
		return "Updated Successfully";
	}
    
    
    
    
}