package com.d208.feelroom.movie.domain.entity;

import jakarta.persistence.Embeddable;
import lombok.*;
import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class MovieDirectorId implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer movieId;
    private Integer directorId;
}