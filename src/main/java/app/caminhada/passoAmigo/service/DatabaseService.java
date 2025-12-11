package app.caminhada.passoAmigo.service;

import app.caminhada.passoAmigo.model.User;
import app.caminhada.passoAmigo.model.Walk;
import app.caminhada.passoAmigo.repository.UserRepository;
import app.caminhada.passoAmigo.repository.WalkRepository;
import app.caminhada.passoAmigo.model.UserEntity;
import app.caminhada.passoAmigo.model.WalkEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DatabaseService {
    private static final Logger logger = LoggerFactory.getLogger(DatabaseService.class);
    
    private final UserRepository userRepository;
    private final WalkRepository walkRepository;

    public DatabaseService(UserRepository userRepository, WalkRepository walkRepository) {
        this.userRepository = userRepository;
        this.walkRepository = walkRepository;
    }

    // Users
    public String createUser(User user) {
        logger.info("Creating user: {}", user.getEmail());
        UserEntity entity = UserEntity.fromUser(user);
        UserEntity saved = userRepository.save(entity);
        logger.info("User created with id: {}", saved.getId());
        return saved.getId().toString();
    }

    public User getUser(String id) {
        try {
            Long longId = Long.parseLong(id);
            return userRepository.findById(longId)
                .map(UserEntity::toUser)
                .orElse(null);
        } catch (NumberFormatException e) {
            logger.warn("Invalid user id format: {}", id);
            return null;
        }
    }

    public List<User> listUsers() {
        return userRepository.findAll().stream()
            .map(UserEntity::toUser)
            .collect(Collectors.toList());
    }

    public boolean updateUser(String id, User user) {
        try {
            Long longId = Long.parseLong(id);
            return userRepository.findById(longId)
                .map(existing -> {
                    UserEntity entity = UserEntity.fromUser(user);
                    entity.setId(longId);
                    userRepository.save(entity);
                    return true;
                })
                .orElse(false);
        } catch (NumberFormatException e) {
            logger.warn("Invalid user id format: {}", id);
            return false;
        }
    }

    public boolean deleteUser(String id) {
        try {
            Long longId = Long.parseLong(id);
            if (userRepository.existsById(longId)) {
                userRepository.deleteById(longId);
                return true;
            }
            return false;
        } catch (NumberFormatException e) {
            logger.warn("Invalid user id format: {}", id);
            return false;
        }
    }

    // Walks
    public String createWalk(Walk walk) {
        logger.info("Creating walk for user: {}", walk.getUserId());
        WalkEntity entity = WalkEntity.fromWalk(walk);
        WalkEntity saved = walkRepository.save(entity);
        logger.info("Walk created with id: {}", saved.getId());
        return saved.getId().toString();
    }

    public Walk getWalk(String id) {
        try {
            Long longId = Long.parseLong(id);
            return walkRepository.findById(longId)
                .map(WalkEntity::toWalk)
                .orElse(null);
        } catch (NumberFormatException e) {
            logger.warn("Invalid walk id format: {}", id);
            return null;
        }
    }

    public List<Walk> listWalksByUser(String userId) {
        return walkRepository.findByUserId(userId).stream()
            .map(WalkEntity::toWalk)
            .collect(Collectors.toList());
    }

    public boolean updateWalk(String id, Walk walk) {
        try {
            Long longId = Long.parseLong(id);
            return walkRepository.findById(longId)
                .map(existing -> {
                    WalkEntity entity = WalkEntity.fromWalk(walk);
                    entity.setId(longId);
                    walkRepository.save(entity);
                    return true;
                })
                .orElse(false);
        } catch (NumberFormatException e) {
            logger.warn("Invalid walk id format: {}", id);
            return false;
        }
    }

    public boolean deleteWalk(String id) {
        try {
            Long longId = Long.parseLong(id);
            if (walkRepository.existsById(longId)) {
                walkRepository.deleteById(longId);
                return true;
            }
            return false;
        } catch (NumberFormatException e) {
            logger.warn("Invalid walk id format: {}", id);
            return false;
        }
    }
}

