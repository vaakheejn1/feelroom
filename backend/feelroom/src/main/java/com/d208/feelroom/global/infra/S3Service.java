// src/main/java/com/d208/feelroom/service/S3Service.java

package com.d208.feelroom.global.infra;

import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration; // Java 8 Date/Time API 사용
import jakarta.annotation.PreDestroy; // Jakarta 어노테이션 사용 (Spring Boot 3.x)

/**
 * S3 서비스 클래스
 * - Presigned URL 생성 (클라이언트가 S3에 직접 업로드하기 위함)
 * - S3 객체 공개 URL 반환 (업로드된 이미지를 웹에서 접근하기 위함)
 * AWS SDK for Java V2 및 S3Config에 정의된 S3Client/S3Presigner 빈 사용
 */
@Service
public class S3Service {

    private final S3Client s3Client;       // S3Config에서 정의된 S3Client 빈 주입
    private final S3Presigner s3Presigner; // S3Config에서 정의된 S3Presigner 빈 주입
    private final String bucketName;
    private final String region;           // S3Config에서 사용한 AWS_REGION 값을 주입받음

    // S3Client, S3Presigner 빈을 생성자 주입으로 받습니다.
    // @Value 어노테이션으로 application.yml의 s3.bucket.name과 환경 변수 AWS_REGION 값을 주입받습니다.
    public S3Service(S3Client s3Client, S3Presigner s3Presigner,
                     @Value("${s3.bucket.name}") String bucketName,
                     @Value("${AWS_REGION}") String region) { // ★★★ AWS_REGION 환경 변수에서 리전 값 주입
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
        this.bucketName = bucketName;
        this.region = region; // S3Service 내부에서 URL 구성 시 사용
    }

    /**
     * S3에 파일을 PUT할 수 있는 Presigned URL을 생성합니다.
     * 클라이언트(프론트엔드)는 이 URL을 사용하여 S3에 직접 파일을 업로드합니다.
     *
     * @param objectKey S3에 저장될 파일의 경로 및 이름 (예: "profile_images/user123_abc.jpg")
     * @return 생성된 Presigned URL 문자열
     */
    public String generatePresignedUrl(String objectKey) {
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(objectKey)
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(5)) // 5분 유효
                .putObjectRequest(putObjectRequest)
                .build();

        PresignedPutObjectRequest presignedPutObjectRequest = s3Presigner.presignPutObject(presignRequest);
        return presignedPutObjectRequest.url().toString();
    }

    /**
     * S3에 업로드된 객체에 직접 접근할 수 있는 공개 URL을 반환합니다.
     * 이 URL은 S3 버킷에 GetObject 권한(버킷 정책)이 설정되어 있어야 웹에서 접근 가능합니다.
     *
     * @param objectKey S3에 저장된 파일의 전체 경로 (예: "profile_images/my_image.jpg")
     * @return S3 객체의 공개 URL 문자열
     */
    public String getPublicUrl(String objectKey) {
        // AWS SDK V2는 S3 객체의 기본 공개 URL을 직접 반환하는 메서드가 없습니다.
        // 대신, 다음과 같이 URL을 직접 구성하여 반환합니다.
        // 이 형식은 표준 S3 객체 URL 형식입니다: https://<bucket-name>.s3.<region>.amazonaws.com/<object-key>
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, objectKey);
    }

    /**
     * S3에서 특정 객체를 삭제합니다.
     * @param objectKey 삭제할 객체의 경로 및 이름
     */
    public void deleteObject(String objectKey) {
        if (objectKey == null || objectKey.isEmpty()) {
            System.out.println("No object key provided for deletion. Skipping.");
            return;
        }
        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .build();
            s3Client.deleteObject(deleteObjectRequest);
            System.out.println("Successfully deleted S3 object: " + objectKey);
        } catch (Exception e) {
            System.err.println("Error deleting S3 object: " + objectKey + ". Error: " + e.getMessage());
            // 필요한 경우 예외를 다시 던지거나 특정 로직 처리
        }
    }


    // S3 URL에서 objectKey를 추출하는 헬퍼 메서드 (UserService 또는 S3Service에 추가 가능)
    // S3Service에 private 메서드로 추가하는 것을 권장합니다.
    public String extractObjectKeyFromS3Url(String s3Url) {
        if (s3Url == null || s3Url.isEmpty()) {
            return null;
        }
        // 예시: "https://feelroom-1.s3.ap-northeast-2.amazonaws.com/profile_images/123/abc.jpg"
        int lastSlashIndex = s3Url.indexOf(".amazonaws.com/");
        if (lastSlashIndex != -1) {
            return s3Url.substring(lastSlashIndex + ".amazonaws.com/".length());
        }
        return null; // 유효한 S3 URL 형식이 아닐 경우
    }

    /**
     * 애플리케이션 종료 시 S3 클라이언트 및 Presigner를 안전하게 닫습니다.
     */
    @PreDestroy
    public void destroy() {
        if (s3Presigner != null) {
            s3Presigner.close();
        }
        if (s3Client != null) {
            s3Client.close();
        }
    }
}