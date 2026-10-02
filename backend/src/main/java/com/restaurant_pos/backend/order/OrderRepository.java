package com.restaurant_pos.backend.order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.Optional;

import java.util.List;
import java.time.Instant;

public interface OrderRepository extends JpaRepository<Order, Long> {
    @Override
    @EntityGraph(attributePaths = "items")
    List<Order> findAll();

    @Override
    @EntityGraph(attributePaths = "items")
    Optional<Order> findById(Long id);

    @EntityGraph(attributePaths = "items")
    List<Order> findByStatusAndCreatedAtGreaterThanEqualAndCreatedAtLessThanOrderByCreatedAtDesc(
            OrderStatus status, Instant from, Instant to);
}
