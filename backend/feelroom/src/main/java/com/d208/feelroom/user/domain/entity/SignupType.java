package com.d208.feelroom.user.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "signup_types")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignupType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "signup_type_id")
    private Integer signupTypeId;

    @Column(name = "value", nullable = false, unique = true, length = 10)
    private String value;
}
