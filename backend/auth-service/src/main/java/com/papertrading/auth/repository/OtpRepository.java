package com.papertrading.auth.repository;

import com.papertrading.auth.model.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<OtpVerification, String> {
    Optional<OtpVerification> findByEmailAndOtpCode(String email, String otpCode);
}
