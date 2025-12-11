package app.caminhada.passoAmigo.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;
import java.util.List;

public class WalkDTO {
    private String id;

    @NotBlank
    private String userId;

    private String startTime; // Aceita ISO string

    private String endTime;

    @Min(0)
    private Double distanceMeters;

    private List<Double> polyline;

    private Integer duration;

    // Getters e Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public Double getDistanceMeters() {
        return distanceMeters;
    }

    public void setDistanceMeters(Double distanceMeters) {
        this.distanceMeters = distanceMeters;
    }

    public List<Double> getPolyline() {
        return polyline;
    }

    public void setPolyline(List<Double> polyline) {
        this.polyline = polyline;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    // Converter para Walk
    public app.caminhada.passoAmigo.model.Walk toWalk() {
        app.caminhada.passoAmigo.model.Walk walk = new app.caminhada.passoAmigo.model.Walk();
        walk.setId(this.id);
        walk.setUserId(this.userId);
        
        // Converter startTime de String para Instant
        if (this.startTime != null && !this.startTime.isEmpty()) {
            try {
                walk.setStartTime(Instant.parse(this.startTime));
            } catch (Exception e) {
                // Se falhar, usar agora
                walk.setStartTime(Instant.now());
            }
        } else {
            walk.setStartTime(Instant.now());
        }
        
        // Converter endTime se existir
        if (this.endTime != null && !this.endTime.isEmpty()) {
            try {
                walk.setEndTime(Instant.parse(this.endTime));
            } catch (Exception e) {
                // Ignora se falhar
            }
        }
        
        walk.setDistanceMeters(this.distanceMeters != null ? this.distanceMeters : 0.0);
        walk.setPolyline(this.polyline);
        
        return walk;
    }
}

