package com.topnet.crm.apm;

import com.topnet.crm.apm.dto.ApplicationInfoResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.info.BuildProperties;
import org.springframework.core.SpringVersion;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.io.File;
import java.sql.Connection;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApmDiscoveryService {

    private final Environment environment;
    private final Optional<BuildProperties> buildProperties;
    private final Optional<DataSource> dataSource;

    public ApplicationInfoResponse getApplicationInfo() {
        return ApplicationInfoResponse.builder()
                .applicationName(resolveApplicationName())
                .version(resolveVersion())
                .environment(resolveEnvironment())
                .buildTime(resolveBuildTime())
                .javaVersion(System.getProperty("java.version"))
                .springVersion(SpringVersion.getVersion())
                .databaseStatus(resolveDatabaseStatus())
                .dockerReady(isDockerReady())
                .discovery(buildDiscoveryMap())
                .build();
    }

    public Map<String, Object> toInfoMap() {
        ApplicationInfoResponse info = getApplicationInfo();
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("applicationName", info.getApplicationName());
        map.put("version", info.getVersion());
        map.put("environment", info.getEnvironment());
        map.put("buildTime", info.getBuildTime());
        map.put("javaVersion", info.getJavaVersion());
        map.put("springVersion", info.getSpringVersion());
        map.put("databaseStatus", info.getDatabaseStatus());
        map.put("dockerReady", info.isDockerReady());
        map.put("discovery", info.getDiscovery());
        return map;
    }

    private String resolveApplicationName() {
        return environment.getProperty("info.app.name", "TOPNET CRM");
    }

    private String resolveVersion() {
        return buildProperties
                .map(BuildProperties::getVersion)
                .orElseGet(() -> environment.getProperty("info.app.version", "unknown"));
    }

    private String resolveEnvironment() {
        String[] profiles = environment.getActiveProfiles();
        if (profiles.length == 0) {
            return environment.getProperty("spring.profiles.default", "default");
        }
        return Arrays.stream(profiles).collect(Collectors.joining(","));
    }

    private String resolveBuildTime() {
        return buildProperties
                .map(BuildProperties::getTime)
                .map(Object::toString)
                .orElse(environment.getProperty("info.app.build-time", "unknown"));
    }

    private String resolveDatabaseStatus() {
        if (dataSource.isEmpty()) {
            return "UNKNOWN";
        }
        try (Connection connection = dataSource.get().getConnection()) {
            return connection.isValid(2) ? "UP" : "DOWN";
        } catch (Exception ex) {
            return "DOWN";
        }
    }

    boolean isDockerReady() {
        if ("true".equalsIgnoreCase(environment.getProperty("DOCKER_READY"))) {
            return true;
        }
        if ("true".equalsIgnoreCase(System.getenv("DOCKER_READY"))) {
            return true;
        }
        return new File("/.dockerenv").exists();
    }

    private Map<String, String> buildDiscoveryMap() {
        String baseUrl = environment.getProperty("topnet.apm.base-url", "http://localhost:8080");
        Map<String, String> discovery = new LinkedHashMap<>();
        discovery.put("health", baseUrl + "/actuator/health");
        discovery.put("info", baseUrl + "/actuator/info");
        discovery.put("metrics", baseUrl + "/actuator/metrics");
        discovery.put("applicationInfo", baseUrl + "/application/info");
        discovery.put("openapi", baseUrl + "/v3/api-docs");
        return discovery;
    }
}
