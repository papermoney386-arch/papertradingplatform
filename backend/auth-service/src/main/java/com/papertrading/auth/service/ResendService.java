package com.papertrading.auth.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResendService {

    @Value("${resend.api.key}")
    private String resendApiKey;

    @Value("${resend.from.email:noreply@papertrading.com}")
    private String fromEmail;

    private final OkHttpClient httpClient = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public void sendOtpEmail(String toEmail, String otpCode) {
        try {
            Map<String, Object> emailPayload = new HashMap<>();
            emailPayload.put("from", fromEmail);
            emailPayload.put("to", toEmail);
            emailPayload.put("subject", "Your Paper Trading Platform OTP");
            emailPayload.put("html", generateOtpHtml(otpCode));

            String jsonBody = objectMapper.writeValueAsString(emailPayload);
            RequestBody body = RequestBody.create(jsonBody, MediaType.get("application/json"));

            Request request = new Request.Builder()
                .url("https://api.resend.com/emails")
                .post(body)
                .addHeader("Authorization", "Bearer " + resendApiKey)
                .build();

            try (Response response = httpClient.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    log.error("Failed to send OTP email: " + response.body().string());
                    throw new IOException("Failed to send email");
                }
                log.info("OTP email sent successfully to: " + toEmail);
            }
        } catch (IOException e) {
            log.error("Error sending OTP email", e);
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }

    private String generateOtpHtml(String otpCode) {
        return "<html><body style='font-family: Arial, sans-serif;'>" +
               "<h2>Your OTP Code</h2>" +
               "<p>Your one-time password for Paper Trading Platform is:</p>" +
               "<h1 style='color: #007bff; letter-spacing: 5px;'>" + otpCode + "</h1>" +
               "<p>This code expires in 5 minutes.</p>" +
               "<p>If you didn't request this, please ignore this email.</p>" +
               "</body></html>";
    }
}
