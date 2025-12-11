package app.caminhada.passoAmigo.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Base64;

@Configuration
public class FirebaseConfig {

    @Value("${firebase.service-account-file:}")
    private String serviceAccountFile;

    @Value("${firebase.service-account-base64:}")
    private String serviceAccountBase64;

    @Value("${firebase.project-id:}")
    private String projectId;

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        if (!FirebaseApp.getApps().isEmpty()) {
            return FirebaseApp.getInstance();
        }

        InputStream credentialsStream = resolveCredentialsStream();
        GoogleCredentials credentials = GoogleCredentials.fromStream(credentialsStream);

        FirebaseOptions.Builder builder = FirebaseOptions.builder().setCredentials(credentials);
        if (projectId != null && !projectId.isBlank()) {
            builder.setProjectId(projectId);
        }

        FirebaseOptions options = builder.build();
        return FirebaseApp.initializeApp(options);
    }

    private InputStream resolveCredentialsStream() throws IOException {
        if (serviceAccountBase64 != null && !serviceAccountBase64.isBlank()) {
            byte[] decoded = Base64.getDecoder().decode(serviceAccountBase64);
            return new ByteArrayInputStream(decoded);
        }
        if (serviceAccountFile != null && !serviceAccountFile.isBlank()) {
            return new FileInputStream(serviceAccountFile);
        }
        throw new IllegalStateException("Firebase credentials not configured. Set 'firebase.service-account-base64' or 'firebase.service-account-file'.");
    }
}


