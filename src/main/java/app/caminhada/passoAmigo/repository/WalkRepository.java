package app.caminhada.passoAmigo.repository;

import app.caminhada.passoAmigo.model.WalkEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WalkRepository extends JpaRepository<WalkEntity, Long> {
    List<WalkEntity> findByUserId(String userId);
}

