package com.d208.feelroom.global.security.dto;

import com.d208.feelroom.user.domain.entity.User;
import com.d208.feelroom.user.domain.UserRole;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Getter
public class UserDetailsImpl implements UserDetails {

    private final User user;

    public UserDetailsImpl(User user) {
        this.user = user;
    }

    // UserDetailsImpl.java

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // 1. DB에서 조회한 user 객체에서 UserRole Enum을 가져옵니다. (예: UserRole.USER)
        UserRole role = user.getUserRole();

        // 2. Enum이 들고 있는 'authority' 값("ROLE_USER")을 가져옵니다.
        String authority = role.getAuthority();

        // 3. "ROLE_USER"라는 문자열로 Spring Security가 인정하는 권한 증명서(SimpleGrantedAuthority)를 만듭니다.
        return Collections.singletonList(new SimpleGrantedAuthority(authority));
    }

    @Override
    public String getPassword() {
        // 현재 로컬 계정만 지원하므로, user.getLocalAccount()는 null 이 아니라고 가정
        // 이후 소셜 OAuth 도입하면 수정되어야 함.
        return user.getLocalAccount().getPasswordHash();
    }

    @Override
    public String getUsername() {
        return user.getUsername();
    }


    // 계정 상태 관련 메서드들
    @Override
    public boolean isAccountNonExpired() {
        return true; // 계정 만료 여부 (true: 만료 안됨)
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // 계정 잠금 여부 (true: 잠금 안됨)
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // 자격 증명(비밀번호) 만료 여부 (true: 만료 안됨)
    }

    @Override
    public boolean isEnabled() {
        return user.getDeletedAt() == null; // 계정 활성화 여부 (삭제되지 않았으면 활성화)
    }
}