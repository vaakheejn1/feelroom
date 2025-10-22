package com.d208.feelroom.user.domain.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.d208.feelroom.user.domain.entity.SignupType;

@Repository
public interface SignupTypeRepository extends JpaRepository<SignupType, Integer> {
    Optional<SignupType> findByValue(String value);
}
