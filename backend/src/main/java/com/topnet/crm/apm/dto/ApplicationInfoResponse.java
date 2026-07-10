package com.topnet.crm.apm.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApplicationInfoResponse {

    private String applicationName;
    private String version;
    private String environment;
    private String buildTime;
    private String javaVersion;
    private String springVersion;
    private String databaseStatus;
    private boolean dockerReady;

    /** Additional discovery metadata for APM platforms */
    private Map<String, String> discovery;
}
