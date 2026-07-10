package com.topnet.crm.customer.dto;

import lombok.Builder;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
public class CustomerImportResult {
    @Builder.Default
    private int totalRows = 0;
    @Builder.Default
    private int successCount = 0;
    @Builder.Default
    private int failureCount = 0;
    @Builder.Default
    private List<String> errors = new ArrayList<>();
}
