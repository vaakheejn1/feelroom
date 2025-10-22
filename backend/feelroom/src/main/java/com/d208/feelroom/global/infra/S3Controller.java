package com.d208.feelroom.global.infra;

import com.d208.feelroom.global.security.dto.UserDetailsImpl;
import com.d208.feelroom.user.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/profile/image")
@RequiredArgsConstructor
@Tag(name = "2.4. User", description = "S3 이미지 업로드 관련 API")
public class S3Controller {

    private final S3Service s3Service;
    private final UserService userService;

    /**
     * [API 1] 사용자 프로필 이미지 업로드를 위한 Presigned PUT URL을 발급합니다.
     * 프론트엔드는 이 URL을 받아 S3에 직접 이미지 파일을 업로드합니다.
     *
     * @param fileName 클라이언트가 업로드할 파일의 원래 이름 (확장자 포함. 예: "my_profile.jpg")
     * @return 성공 시 Presigned URL 및 objectKey를 포함하는 JSON (Map<String, String>)
     */
    @GetMapping("/presigned-url")
    public ResponseEntity<Map<String, String>> getPresignedUrl(
                                                                @AuthenticationPrincipal UserDetailsImpl userDetails,
                                                                @RequestParam String fileName) {
        Long userId = 1L;
        String objectKey = "profile_images/" + userId + "/" +
                UUID.randomUUID() + "_" + fileName;

        String presignedUrl = s3Service.generatePresignedUrl(objectKey);

        Map<String, String> response = new HashMap<>();
        response.put("presignedUrl", presignedUrl);
        response.put("objectKey", objectKey);

        return ResponseEntity.ok(response);
    }

    /**
     * [API 2] S3 업로드 완료 후, 사용자 프로필 이미지 URL을 DB에 저장하는 API.
     * 프론트엔드가 S3에 이미지를 성공적으로 업로드한 후 이 API를 호출하여 DB를 업데이트합니다.
     *
     * @param payload S3에 업로드된 objectKey 정보를 포함하는 JSON
     *                예시: { "objectKey": "profile_images/123/a1b2c3d4-e5f6-7890-abcd-efgh12345678_originalFileName.jpg" }
     * @return 성공 시 200 OK
     */
    @PutMapping("/upload")
    public ResponseEntity<Void> updateProfileImage(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, String> payload) {
        Long userId = userDetails.getUser().getUserId();
        String objectKey = payload.get("objectKey");
        if (objectKey == null || objectKey.isEmpty()) {
            return ResponseEntity.badRequest().build(); // objectKey가 없으면 400 Bad Request
        }

        userService.updateUserProfileImageUrl(userId, objectKey); // UserService 호출하여 DB 업데이트

        return ResponseEntity.ok().build(); // 성공 시 200 OK 응답
    }
}