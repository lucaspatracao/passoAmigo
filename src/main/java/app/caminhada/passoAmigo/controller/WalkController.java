package app.caminhada.passoAmigo.controller;

import app.caminhada.passoAmigo.dto.WalkDTO;
import app.caminhada.passoAmigo.model.Walk;
import app.caminhada.passoAmigo.service.DatabaseService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/walks")
public class WalkController {

    private static final Logger logger = LoggerFactory.getLogger(WalkController.class);
    private final DatabaseService databaseService;

    public WalkController(DatabaseService databaseService) {
        this.databaseService = databaseService;
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody WalkDTO walkDTO) {
        try {
            logger.info("Creating walk for user: {}", walkDTO.getUserId());
            Walk walk = walkDTO.toWalk();
            String id = databaseService.createWalk(walk);
            walk.setId(id);
            logger.info("Walk created successfully with id: {}", id);
            
            // Converter de volta para DTO para resposta
            WalkDTO response = new WalkDTO();
            response.setId(walk.getId());
            response.setUserId(walk.getUserId());
            response.setStartTime(walk.getStartTime() != null ? walk.getStartTime().toString() : null);
            response.setEndTime(walk.getEndTime() != null ? walk.getEndTime().toString() : null);
            response.setDistanceMeters(walk.getDistanceMeters());
            response.setPolyline(walk.getPolyline());
            
            return ResponseEntity.created(URI.create("/api/walks/" + id)).body(response);
        } catch (Exception e) {
            logger.error("Error creating walk", e);
            throw new RuntimeException("Erro ao criar caminhada", e);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable String id) {
        try {
            logger.debug("Getting walk with id: {}", id);
            Walk walk = databaseService.getWalk(id);
            if (walk == null) {
                logger.warn("Walk not found with id: {}", id);
                return ResponseEntity.notFound().build();
            }
            
            // Converter para DTO
            WalkDTO dto = new WalkDTO();
            dto.setId(walk.getId());
            dto.setUserId(walk.getUserId());
            dto.setStartTime(walk.getStartTime() != null ? walk.getStartTime().toString() : null);
            dto.setEndTime(walk.getEndTime() != null ? walk.getEndTime().toString() : null);
            dto.setDistanceMeters(walk.getDistanceMeters());
            dto.setPolyline(walk.getPolyline());
            
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            logger.error("Error getting walk with id: {}", id, e);
            throw new RuntimeException("Erro ao buscar caminhada", e);
        }
    }

    @GetMapping("/user/{userId}")
    public List<WalkDTO> listByUser(@PathVariable String userId) {
        try {
            logger.debug("Listing walks for user: {}", userId);
            List<Walk> walks = databaseService.listWalksByUser(userId);
            return walks.stream().map(walk -> {
                WalkDTO dto = new WalkDTO();
                dto.setId(walk.getId());
                dto.setUserId(walk.getUserId());
                dto.setStartTime(walk.getStartTime() != null ? walk.getStartTime().toString() : null);
                dto.setEndTime(walk.getEndTime() != null ? walk.getEndTime().toString() : null);
                dto.setDistanceMeters(walk.getDistanceMeters());
                dto.setPolyline(walk.getPolyline());
                return dto;
            }).collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error listing walks for user: {}", userId, e);
            throw new RuntimeException("Erro ao listar caminhadas", e);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @Valid @RequestBody WalkDTO walkDTO) {
        try {
            logger.info("Updating walk with id: {}", id);
            Walk walk = walkDTO.toWalk();
            boolean ok = databaseService.updateWalk(id, walk);
            if (!ok) {
                logger.warn("Walk not found for update with id: {}", id);
                return ResponseEntity.notFound().build();
            }
            walk.setId(id);
            logger.info("Walk updated successfully with id: {}", id);
            
            // Converter de volta para DTO
            walkDTO.setId(id);
            return ResponseEntity.ok(walkDTO);
        } catch (Exception e) {
            logger.error("Error updating walk with id: {}", id, e);
            throw new RuntimeException("Erro ao atualizar caminhada", e);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        try {
            logger.info("Deleting walk with id: {}", id);
            boolean ok = databaseService.deleteWalk(id);
            if (!ok) {
                logger.warn("Walk not found for deletion with id: {}", id);
                return ResponseEntity.notFound().build();
            }
            logger.info("Walk deleted successfully with id: {}", id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting walk with id: {}", id, e);
            throw new RuntimeException("Erro ao excluir caminhada", e);
        }
    }
}


