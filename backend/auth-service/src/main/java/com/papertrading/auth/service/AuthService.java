package com.papertrading.auth.service;

import com.papertrading.auth.dto.AuthRequest;
import com.papertrading.auth.dto.AuthResponse;
import com.papertrading.auth.dto.OtpRequest;
import com.papertrading.auth.model.OtpVerification;
import com.papertrading.auth.model.User;
import com.papertrading.auth.repository.OtpRepository;
import com.papertrading.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final OtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ResendService resendService;

    @Value("${app.jwt.expiration:86400000}")
    private Long jwtExpiration;

    public void sendOtp(String email) {
        String otpCode = generateOtp();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(5);

        OtpVerification otp = OtpVerification.builder()
            .email(email)
            .otpCode(otpCode)
            .isUsed(false)
            .expiresAt(expiresAt)
            .build();

        otpRepository.save(otp);
        resendService.sendOtpEmail(email, otpCode);
    }

    public AuthResponse verifyOtpAndRegister(OtpRequest request, AuthRequest authRequest) {
        OtpVerification otp = otpRepository.findByEmailAndOtpCode(request.getEmail(), request.getOtpCode())
            .orElseThrow(() -> new IllegalArgumentException("Invalid OTP"));

        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("OTP expired");
        }

        if (otp.getIsUsed()) {
            throw new IllegalArgumentException("OTP already used");
        }

        otp.setIsUsed(true);
        otpRepository.save(otp);

        User user = User.builder()
            .email(request.getEmail())
            .fullName(authRequest.getFullName())
            .password(passwordEncoder.encode(authRequest.getPassword()))
            .emailVerified(true)
            .isActive(true)
            .build();

        User savedUser = userRepository.save(user);

        String token = jwtService.generateToken(savedUser.getId(), savedUser.getEmail());

        return AuthResponse.builder()
            .id(savedUser.getId())
            .email(savedUser.getEmail())
            .fullName(savedUser.getFullName())
            .accessToken(token)
            .tokenType("Bearer")
            .expiresIn(jwtExpiration / 1000)
            .build();
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid password");
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail());

        return AuthResponse.builder()
            .id(user.getId())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .accessToken(token)
            .tokenType("Bearer")
            .expiresIn(jwtExpiration / 1000)
            .build();
    }

    private String generateOtp() {
        Random random = new Random();
        return String.format("%06d", random.nextInt(1000000));
    }
}
