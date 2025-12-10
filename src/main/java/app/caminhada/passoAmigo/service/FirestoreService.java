package app.caminhada.passoAmigo.service;

import app.caminhada.passoAmigo.model.User;
import app.caminhada.passoAmigo.model.Walk;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@Service
public class FirestoreService {

    private Firestore getDb() {
        return FirestoreClient.getFirestore();
    }

    // Users
    public String createUser(User user) throws ExecutionException, InterruptedException {
        CollectionReference users = getDb().collection("users");
        DocumentReference ref = users.document();
        user.setId(ref.getId());
        ApiFuture<WriteResult> result = ref.set(userToMap(user));
        result.get();
        return ref.getId();
    }

    public User getUser(String id) throws ExecutionException, InterruptedException {
        DocumentSnapshot snapshot = getDb().collection("users").document(id).get().get();
        if (!snapshot.exists()) return null;
        return mapToUser(snapshot);
    }

    public List<User> listUsers() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = getDb().collection("users").get();
        List<QueryDocumentSnapshot> docs = future.get().getDocuments();
        List<User> users = new ArrayList<>();
        for (QueryDocumentSnapshot doc : docs) {
            users.add(mapToUser(doc));
        }
        return users;
    }

    public boolean updateUser(String id, User user) throws ExecutionException, InterruptedException {
        DocumentReference ref = getDb().collection("users").document(id);
        if (!ref.get().get().exists()) return false;
        user.setId(id);
        ref.set(userToMap(user)).get();
        return true;
    }

    public boolean deleteUser(String id) throws ExecutionException, InterruptedException {
        DocumentReference ref = getDb().collection("users").document(id);
        if (!ref.get().get().exists()) return false;
        ref.delete().get();
        return true;
    }

    private Map<String, Object> userToMap(User user) {
        return Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail()
        );
    }

    private User mapToUser(DocumentSnapshot doc) {
        User u = new User();
        u.setId(doc.getString("id"));
        u.setName(doc.getString("name"));
        u.setEmail(doc.getString("email"));
        return u;
    }

    // Walks
    public String createWalk(Walk walk) throws ExecutionException, InterruptedException {
        CollectionReference col = getDb().collection("walks");
        DocumentReference ref = col.document();
        walk.setId(ref.getId());
        ref.set(walkToMap(walk)).get();
        return ref.getId();
    }

    public Walk getWalk(String id) throws ExecutionException, InterruptedException {
        DocumentSnapshot snapshot = getDb().collection("walks").document(id).get().get();
        if (!snapshot.exists()) return null;
        return mapToWalk(snapshot);
    }

    public List<Walk> listWalksByUser(String userId) throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = getDb().collection("walks")
                .whereEqualTo("userId", userId)
                .get();
        List<QueryDocumentSnapshot> docs = future.get().getDocuments();
        List<Walk> walks = new ArrayList<>();
        for (QueryDocumentSnapshot doc : docs) {
            walks.add(mapToWalk(doc));
        }
        return walks;
    }

    public boolean updateWalk(String id, Walk walk) throws ExecutionException, InterruptedException {
        DocumentReference ref = getDb().collection("walks").document(id);
        if (!ref.get().get().exists()) return false;
        walk.setId(id);
        ref.set(walkToMap(walk)).get();
        return true;
    }

    public boolean deleteWalk(String id) throws ExecutionException, InterruptedException {
        DocumentReference ref = getDb().collection("walks").document(id);
        if (!ref.get().get().exists()) return false;
        ref.delete().get();
        return true;
    }

    private Map<String, Object> walkToMap(Walk walk) {
        return Map.of(
                "id", walk.getId(),
                "userId", walk.getUserId(),
                "startTime", walk.getStartTime() == null ? null : walk.getStartTime().toString(),
                "endTime", walk.getEndTime() == null ? null : walk.getEndTime().toString(),
                "distanceMeters", walk.getDistanceMeters(),
                "polyline", walk.getPolyline()
        );
    }

    private Walk mapToWalk(DocumentSnapshot doc) {
        Walk w = new Walk();
        w.setId(doc.getString("id"));
        w.setUserId(doc.getString("userId"));
        String start = doc.getString("startTime");
        String end = doc.getString("endTime");
        if (start != null) w.setStartTime(java.time.Instant.parse(start));
        if (end != null) w.setEndTime(java.time.Instant.parse(end));
        Double distance = doc.getDouble("distanceMeters");
        w.setDistanceMeters(distance == null ? 0 : distance);
        @SuppressWarnings("unchecked")
        List<Double> poly = (List<Double>) doc.get("polyline");
        w.setPolyline(poly);
        return w;
    }
}


