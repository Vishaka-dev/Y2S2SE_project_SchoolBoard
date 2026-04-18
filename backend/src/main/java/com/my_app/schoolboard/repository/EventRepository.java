package com.my_app.schoolboard.repository;

import com.my_app.schoolboard.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findAllByOrderByEventDateAsc();
    List<Event> findByEventDateAfterOrderByEventDateAsc(LocalDateTime date);
}
