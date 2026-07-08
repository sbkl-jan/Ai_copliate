package com.copilot.repository;

import com.copilot.model.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface AppointmentRepository extends MongoRepository<Appointment, String> {

    @Query("{ 'businessId': ?0, 'status': { $ne: 'cancelled' }, 'startTime': { $lt: ?2 }, 'endTime': { $gt: ?1 } }")
    List<Appointment> findOverlappingAppointments(String businessId, Instant startTime, Instant endTime);
}
