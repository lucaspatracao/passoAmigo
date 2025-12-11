package app.caminhada.passoAmigo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "users")
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(min = 2, max = 60)
    @Column(nullable = false)
    private String name;

    @NotBlank
    @Email
    @Column(nullable = false, unique = true)
    private String email;

    private String role;
    private String cargo;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getCargo() {
        return cargo;
    }

    public void setCargo(String cargo) {
        this.cargo = cargo;
    }

    // Converter para User (modelo antigo)
    public User toUser() {
        User user = new User();
        user.setId(this.id != null ? this.id.toString() : null);
        user.setName(this.name);
        user.setEmail(this.email);
        return user;
    }

    // Criar a partir de User
    public static UserEntity fromUser(User user) {
        UserEntity entity = new UserEntity();
        if (user.getId() != null && !user.getId().isEmpty()) {
            try {
                entity.setId(Long.parseLong(user.getId()));
            } catch (NumberFormatException e) {
                // Ignora se não for número
            }
        }
        entity.setName(user.getName());
        entity.setEmail(user.getEmail());
        return entity;
    }
}

