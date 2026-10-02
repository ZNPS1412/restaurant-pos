package com.restaurant_pos.backend.menu;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuRepository extends JpaRepository<Menu, Long> {
    boolean existsByCategoryId(Long categoryId);
}
