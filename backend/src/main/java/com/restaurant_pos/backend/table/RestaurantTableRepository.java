package com.restaurant_pos.backend.table;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select t from RestaurantTable t where t.id = :id")
    RestaurantTable findByIdForUpdate(@Param("id") Long id);

    @Query(value = "select t.* from restaurant_tables t join orders o on o.table_id = t.id where o.id = :orderId for update of t", nativeQuery = true)
    RestaurantTable findByOrderIdForUpdate(@Param("orderId") Long orderId);
}
