package app.caminhada.passoAmigo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "walks")
public class WalkEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String userId;

    @NotNull
    @Column(nullable = false)
    private Instant startTime;

    private Instant endTime;

    @Min(0)
    @Column(nullable = false)
    private Double distanceMeters;

    @Column(columnDefinition = "TEXT")
    private String polylineJson; // JSON string para armazenar polyline

    private Integer duration; // em segundos

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Instant getStartTime() {
        return startTime;
    }

    public void setStartTime(Instant startTime) {
        this.startTime = startTime;
    }

    public Instant getEndTime() {
        return endTime;
    }

    public void setEndTime(Instant endTime) {
        this.endTime = endTime;
    }

    public Double getDistanceMeters() {
        return distanceMeters;
    }

    public void setDistanceMeters(Double distanceMeters) {
        this.distanceMeters = distanceMeters;
    }

    public String getPolylineJson() {
        return polylineJson;
    }

    public void setPolylineJson(String polylineJson) {
        this.polylineJson = polylineJson;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    // Converter para Walk (modelo antigo)
    public Walk toWalk() {
        Walk walk = new Walk();
        walk.setId(this.id != null ? this.id.toString() : null);
        walk.setUserId(this.userId);
        walk.setStartTime(this.startTime);
        walk.setEndTime(this.endTime);
        walk.setDistanceMeters(this.distanceMeters != null ? this.distanceMeters : 0.0);
        
        // Converter polyline JSON para List<Double>
        if (this.polylineJson != null && !this.polylineJson.isEmpty()) {
            try {
                // Parse simples do JSON (formato: [lat1, lon1, lat2, lon2, ...])
                String json = this.polylineJson.trim();
                if (json.startsWith("[") && json.endsWith("]")) {
                    json = json.substring(1, json.length() - 1);
                    String[] parts = json.split(",");
                    List<Double> polyline = new ArrayList<>();
                    for (String part : parts) {
                        try {
                            polyline.add(Double.parseDouble(part.trim()));
                        } catch (NumberFormatException e) {
                            // Ignora valores inválidos
                        }
                    }
                    walk.setPolyline(polyline);
                }
            } catch (Exception e) {
                // Se falhar, deixa polyline null
            }
        }
        
        return walk;
    }

    // Criar a partir de Walk
    public static WalkEntity fromWalk(Walk walk) {
        WalkEntity entity = new WalkEntity();
        if (walk.getId() != null && !walk.getId().isEmpty()) {
            try {
                entity.setId(Long.parseLong(walk.getId()));
            } catch (NumberFormatException e) {
                // Ignora se não for número
            }
        }
        entity.setUserId(walk.getUserId());
        entity.setStartTime(walk.getStartTime() != null ? walk.getStartTime() : Instant.now());
        entity.setEndTime(walk.getEndTime());
        entity.setDistanceMeters(walk.getDistanceMeters());
        
        // Converter polyline para JSON string
        if (walk.getPolyline() != null && !walk.getPolyline().isEmpty()) {
            entity.setPolylineJson(walk.getPolyline().toString());
        }
        
        return entity;
    }
}

