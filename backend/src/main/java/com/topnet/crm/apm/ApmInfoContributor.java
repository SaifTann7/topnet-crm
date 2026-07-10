package com.topnet.crm.apm;

import org.springframework.boot.actuate.info.Info;
import org.springframework.boot.actuate.info.InfoContributor;
import org.springframework.stereotype.Component;

@Component
public class ApmInfoContributor implements InfoContributor {

    private final ApmDiscoveryService apmDiscoveryService;

    public ApmInfoContributor(ApmDiscoveryService apmDiscoveryService) {
        this.apmDiscoveryService = apmDiscoveryService;
    }

    @Override
    public void contribute(Info.Builder builder) {
        builder.withDetails(apmDiscoveryService.toInfoMap());
    }
}
