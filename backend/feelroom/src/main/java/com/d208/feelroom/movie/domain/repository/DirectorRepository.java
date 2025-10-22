package com.d208.feelroom.movie.domain.repository;

import com.d208.feelroom.movie.domain.entity.Director;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DirectorRepository extends JpaRepository<Director, Integer> {
    Optional<Director> findByName(String name);
}
