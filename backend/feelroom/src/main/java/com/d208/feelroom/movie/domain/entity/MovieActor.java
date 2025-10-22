package com.d208.feelroom.movie.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "movie_actor")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovieActor {
    @EmbeddedId
    private MovieActorId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("movieId")
    @JoinColumn(name = "movie_id")
    private Movie movie;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("actorId")
    @JoinColumn(name = "actor_id")
    private Actor actor;
}