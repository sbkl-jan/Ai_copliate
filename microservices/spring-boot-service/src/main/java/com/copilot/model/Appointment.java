package com.copilot.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document(collection = "appointments")
public class Appointment {
    @Id
    private String id;
    private String businessId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String title;
    private Instant startTime;
    private Instant endTime;
    private String status; // pending, confirmed, cancelled
}
