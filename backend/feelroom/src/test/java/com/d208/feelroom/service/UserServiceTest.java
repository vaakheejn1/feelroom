package com.d208.feelroom.service;

import com.d208.feelroom.user.domain.repository.UserRepository;
import com.d208.feelroom.user.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    private UserService userService;

//    @BeforeEach
//    void setUp() {
//        userService = new UserService(userRepository);
//    }

    // 아이디 중복 확인 테스트
    @Test
    @DisplayName("아이디 사용 가능 시 true 를 리턴하는 테스트")
    void shouldReturnTrueWhenUsernameIsAvailable() {
        // given
        String username = "newuser";
        when(userRepository.existsByUsername(username)).thenReturn(false);

        // when
        boolean result = userService.isUsernameAvailable(username);

        // then
        // assertThat(result).isTrue();
        assertTrue(result);
        verify(userRepository).existsByUsername(username);
    }

    @Test
    @DisplayName("아이디 사용 불가능 시 false 를 리턴하는 테스트")
    void shouldReturnFalseWhenUsernameIsTaken() {
        // given
        String username = "existinguser";
        when(userRepository.existsByUsername(username)).thenReturn(true);

        // when
        boolean result = userService.isUsernameAvailable(username);

        // then
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("아이디가 null 이면 false 를 리턴")
    void shouldReturnFalseForNullUsername() {
        boolean result = userService.isUsernameAvailable(null);
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("여백으로만 이루어진 값이면 false 를 리턴")
    void shouldRejectWhitespaceUsername() {
        assertThat(userService.isUsernameAvailable("   ")).isFalse();
    }

    @Test
    @DisplayName("아이디가 50자 이상이면 false 를 리턴")
    void shouldHandleVeryLongUsername() {
        String longUsername = "a".repeat(300);

        boolean result = userService.isUsernameAvailable(longUsername);
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("아이디가 2자 이하이면 false 를 리턴")
    void shouldRejectTooShortUsername() {
        assertThat(userService.isUsernameAvailable("ab")).isFalse();
    }

    @Test
    @DisplayName("아이디가 3자 이상이면 true 를 리턴 (단, 중복되지 않은 경우)")
    void shouldAcceptMinLengthUsernameIfAvailable() {
        String username = "abc";
        when(userRepository.existsByUsername(username)).thenReturn(false);
        assertThat(userService.isUsernameAvailable(username)).isTrue();
    }

    // 이메일 중복 확인 테스트
    @Test
    @DisplayName("이메일 사용 가능 시 true 를 리턴하는 테스트")
    void shouldReturnTrueWhenEmailIsAvailable() {
        String email = "test@example.com";
        when(userRepository.existsByEmail(email)).thenReturn(false);

        boolean result = userService.isEmailAvailable(email);
        assertThat(result).isTrue();
        verify(userRepository).existsByEmail(email);
    }

    @Test
    @DisplayName("이메일이 이미 존재할 경우 false 리턴")
    void shouldReturnFalseWhenEmailIsTaken() {
        String email = "taken@example.com";
        when(userRepository.existsByEmail(email)).thenReturn(true);

        boolean result = userService.isEmailAvailable(email);
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("이메일이 null 이면 false 를 리턴")
    void shouldReturnFalseForNullEmail() {
        boolean result = userService.isEmailAvailable(null);
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("이메일이 공백이면 false")
    void shouldRejectEmptyEmail() {
        assertThat(userService.isEmailAvailable("   ")).isFalse();
    }

    @Test
    @DisplayName("유효하지 않은 이메일 형식이면 false")
    void shouldRejectInvalidEmailFormat() {
        String invalidEmail = "invalid-email";
        assertThat(userService.isEmailAvailable(invalidEmail)).isFalse();
    }

}
