package com.d208.feelroom.user.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendVerificationEmail(String to, String verificationCode) {
        // if (to == null || to.trim().isEmpty()) {
        // return ResponseEntity.badRequest().body(Map.of("success", false, "message",
        // "이메일을 입력해주세요."));
        // }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("sjhanslee@gmail.com");
            message.setTo(to);
            message.setSubject("이메일 인증 코드");
            message.setText(
                    "안녕하세요!\n\n" +
                            "요청하신 이메일 인증 코드입니다:\n\n" +
                            "인증 코드: " + verificationCode + "\n\n" +
                            "이 코드는 5분간 유효합니다.\n" +
                            "만약 본인이 요청하지 않았다면 이 메일을 무시해주세요.\n\n" +
                            "감사합니다.");
            mailSender.send(message);
            System.out.println("메일 전송 완료");
        } catch (Exception e) {
            System.err.println("메일 전송 실패: " + e.getMessage());
            e.printStackTrace();
        }
    }
}