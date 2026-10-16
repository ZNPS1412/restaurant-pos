package com.restaurant_pos.backend.order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

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
    List<Order> findByTableIdAndStatus(Long tableId, OrderStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = "items")
    @Query("select o from Order o where o.tableId = :tableId and o.status = :status")
    List<Order> findByTableIdAndStatusForUpdate(Long tableId, OrderStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = "items")
    @Query("select o from Order o where o.id = :id")
    Optional<Order> findByIdForUpdate(@Param("id") Long id);

    @Modifying(flushAutomatically = true, clearAutomatically = false)
    @Query(value = "update orders set table_id = -id where id in (:firstId, :secondId)", nativeQuery = true)
    int moveOrdersToUniqueTemporaryTables(@Param("firstId") Long firstId, @Param("secondId") Long secondId);

    @Modifying(flushAutomatically = true, clearAutomatically = false)
    @Query(value = "update orders set table_id = case when id = :firstId then :firstTableId else :secondTableId end where id in (:firstId, :secondId)", nativeQuery = true)
    int completeOrderSwap(@Param("firstId") Long firstId, @Param("firstTableId") Long firstTableId,
                          @Param("secondId") Long secondId, @Param("secondTableId") Long secondTableId);

    @EntityGraph(attributePaths = "items")
    List<Order> findByStatusAndUpdatedAtGreaterThanEqualAndUpdatedAtLessThanOrderByUpdatedAtDesc(
            OrderStatus status, Instant from, Instant to);
}
