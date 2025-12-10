package app.caminhada.passoAmigo.controller;

import app.caminhada.passoAmigo.model.User;
import app.caminhada.passoAmigo.service.DatabaseService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private final DatabaseService databaseService;

    public UserController(DatabaseService databaseService) {
        this.databaseService = databaseService;
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody User user) {
        try {
            logger.info("Creating user: {}", user.getEmail());
            String id = databaseService.createUser(user);
            user.setId(id);
            logger.info("User created successfully with id: {}", id);
            return ResponseEntity.created(URI.create("/api/users/" + id)).body(user);
        } catch (Exception e) {
            logger.error("Error creating user", e);
            throw new RuntimeException("Erro ao criar usuário", e);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable String id) {
        try {
            logger.debug("Getting user with id: {}", id);
            User user = databaseService.getUser(id);
            if (user == null) {
                logger.warn("User not found with id: {}", id);
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            logger.error("Error getting user with id: {}", id, e);
            throw new RuntimeException("Erro ao buscar usuário", e);
        }
    }

    @GetMapping
    public List<User> list() {
        try {
            logger.debug("Listing all users");
            return databaseService.listUsers();
        } catch (Exception e) {
            logger.error("Error listing users", e);
            throw new RuntimeException("Erro ao listar usuários", e);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @Valid @RequestBody User user) {
        try {
            logger.info("Updating user with id: {}", id);
            boolean ok = databaseService.updateUser(id, user);
            if (!ok) {
                logger.warn("User not found for update with id: {}", id);
                return ResponseEntity.notFound().build();
            }
            user.setId(id);
            logger.info("User updated successfully with id: {}", id);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            logger.error("Error updating user with id: {}", id, e);
            throw new RuntimeException("Erro ao atualizar usuário", e);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        try {
            logger.info("Deleting user with id: {}", id);
            boolean ok = databaseService.deleteUser(id);
            if (!ok) {
                logger.warn("User not found for deletion with id: {}", id);
                return ResponseEntity.notFound().build();
            }
            logger.info("User deleted successfully with id: {}", id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting user with id: {}", id, e);
            throw new RuntimeException("Erro ao excluir usuário", e);
        }
    }
}


