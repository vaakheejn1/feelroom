package com.d208.feelroom.movie.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "keywords")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Keyword {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "keyword_id")
    private Integer keywordId;

    @Column(nullable = false, length = 100)
    private String name;
}
