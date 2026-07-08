package com.copilot.controller;

import com.copilot.model.Appointment;
import com.copilot.model.AppointmentConflictRequest;
import com.copilot.model.AppointmentConflictResponse;
import com.copilot.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @PostMapping("/check-conflict")
    public ResponseEntity<AppointmentConflictResponse> checkConflict(@RequestBody AppointmentConflictRequest request) {
        if (request.getBusinessId() == null || request.getStartTime() == null || request.getEndTime() == null) {
            return ResponseEntity.badRequest().body(new AppointmentConflictResponse(false, "Invalid input data fields"));
        }

        List<Appointment> conflicts = appointmentRepository.findOverlappingAppointments(
                request.getBusinessId(),
                request.getStartTime(),
                request.getEndTime()
        );

        boolean hasConflict = !conflicts.isEmpty();
        String message = hasConflict 
                ? "Conflict detected with " + conflicts.size() + " existing appointment(s)"
                : "No conflicts detected. Time slot is open.";

        return ResponseEntity.ok(new AppointmentConflictResponse(hasConflict, message));
    }
}
