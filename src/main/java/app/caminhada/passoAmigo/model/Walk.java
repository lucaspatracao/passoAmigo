package app.caminhada.passoAmigo.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;

public class Walk {
    private String id;

    @NotBlank
    private String userId;

    @NotNull
    private Instant startTime;

    private Instant endTime;

    @Min(0)
    private double distanceMeters;

    private List<Double> polyline; // [lat1, lon1, lat2, lon2, ...]

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

    public double getDistanceMeters() {
        return distanceMeters;
    }

    public void setDistanceMeters(double distanceMeters) {
        this.distanceMeters = distanceMeters;
    }

    public List<Double> getPolyline() {
        return polyline;
    }

    public void setPolyline(List<Double> polyline) {
        this.polyline = polyline;
    }
}


