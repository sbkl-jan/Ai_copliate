package com.copilot.controller;

import com.copilot.model.Appointment;
import com.copilot.repository.AppointmentRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AppointmentController.class)
public class AppointmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AppointmentRepository appointmentRepository;

    @Test
    public void testCheckConflict_NoOverlap() throws Exception {
        String businessId = "biz123";
        Instant start = Instant.parse("2026-07-08T10:00:00Z");
        Instant end = Instant.parse("2026-07-08T11:00:00Z");

        // Mock empty conflict list
        Mockito.when(appointmentRepository.findOverlappingAppointments(businessId, start, end))
                .thenReturn(new ArrayList<>());

        String requestBody = "{\"businessId\":\"biz123\",\"startTime\":\"2026-07-08T10:00:00Z\",\"endTime\":\"2026-07-08T11:00:00Z\"}";

        mockMvc.perform(post("/api/appointments/check-conflict")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hasConflict").value(false))
                .andExpect(jsonPath("$.message").value("No conflicts detected. Time slot is open."));
    }

    @Test
    public void testCheckConflict_WithOverlap() throws Exception {
        String businessId = "biz123";
        Instant start = Instant.parse("2026-07-08T10:00:00Z");
        Instant end = Instant.parse("2026-07-08T11:00:00Z");

        // Mock conflicting appointment
        List<Appointment> conflicts = new ArrayList<>();
        Appointment existing = new Appointment();
        existing.setId("appt999");
        existing.setTitle("Existing Meeting");
        conflicts.add(existing);

        Mockito.when(appointmentRepository.findOverlappingAppointments(businessId, start, end))
                .thenReturn(conflicts);

        String requestBody = "{\"businessId\":\"biz123\",\"startTime\":\"2026-07-08T10:00:00Z\",\"endTime\":\"2026-07-08T11:00:00Z\"}";

        mockMvc.perform(post("/api/appointments/check-conflict")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hasConflict").value(true))
                .andExpect(jsonPath("$.message").value("Conflict detected with 1 existing appointment(s)"));
    }
}
