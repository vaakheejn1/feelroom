package com.d208.feelroom.global.util; // 실제 프로젝트의 패키지 경로에 맞게 수정하세요.

import java.nio.ByteBuffer;
import java.util.UUID;

/**
 * UUID 관련 유틸리티 메서드를 모아놓은 클래스.
 */
public final class UuidUtils {

    /**
     * 이 클래스는 인스턴스화할 수 없습니다.
     * 유틸리티 클래스는 상태를 가지지 않으므로 static 메서드만으로 구성하는 것이 좋습니다.
     */
    private UuidUtils() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    /**
     * 16바이트 배열(byte[])을 UUID 객체로 변환합니다.
     * 데이터베이스의 BINARY(16) 컬럼 값을 Java의 UUID로 변환할 때 사용됩니다.
     *
     * @param bytes 16바이트 길이의 배열
     * @return 변환된 UUID 객체
     * @throws IllegalArgumentException bytes가 null이거나 길이가 16이 아닐 경우
     */
    public static UUID bytesToUUID(byte[] bytes) {
        if (bytes == null || bytes.length != 16) {
            throw new IllegalArgumentException("Invalid UUID bytes: must be 16 bytes long.");
        }
        ByteBuffer bb = ByteBuffer.wrap(bytes);
        long mostSigBits = bb.getLong();
        long leastSigBits = bb.getLong();
        return new UUID(mostSigBits, leastSigBits);
    }
}