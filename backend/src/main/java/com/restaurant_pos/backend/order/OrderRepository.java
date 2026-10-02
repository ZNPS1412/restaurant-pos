package com.restaurant_pos.backend.order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.Optional;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    @Override
    @EntityGraph(attributePaths = "items")
    List<Order> findAll();

    @Override
    @EntityGraph(attributePaths = "items")
    Optional<Order> findById(Long id);
}
