package com.copilot.model;

import lombok.Data;
import java.time.Instant;

@Data
public class AppointmentConflictRequest {
    private String businessId;
    private Instant startTime;
    private Instant endTime;
}
