package com.restaurant_pos.backend.sales;

import com.restaurant_pos.backend.menu.Menu;
import com.restaurant_pos.backend.menu.MenuRepository;
import com.restaurant_pos.backend.order.Order;
import com.restaurant_pos.backend.order.OrderRepository;
import com.restaurant_pos.backend.order.OrderStatus;
import com.restaurant_pos.backend.order.PaymentMethod;
import com.restaurant_pos.backend.orderitem.OrderItem;
import com.restaurant_pos.backend.table.RestaurantTable;
import com.restaurant_pos.backend.table.RestaurantTableRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class SalesHistoryService {
    private final OrderRepository orders;
    private final MenuRepository menus;
    private final RestaurantTableRepository tables;

    public SalesHistoryService(OrderRepository orders, MenuRepository menus,
                               RestaurantTableRepository tables) {
        this.orders = orders;
        this.menus = menus;
        this.tables = tables;
    }

    @Transactional
    public HistoryResponse findCompleted(Instant from, Instant to) {
        List<Order> completed = orders
                .findByStatusAndCreatedAtGreaterThanEqualAndCreatedAtLessThanOrderByCreatedAtDesc(
                        OrderStatus.COMPLETED, from, to);
        Map<Long, Menu> menuById = menus.findAllById(completed.stream()
                        .flatMap(order -> order.getItems().stream())
                        .map(OrderItem::getMenuId)
                        .collect(Collectors.toSet()))
                .stream()
                .collect(Collectors.toMap(Menu::getId, Function.identity()));
        Map<Long, RestaurantTable> tableById = tables.findAllById(completed.stream()
                        .map(Order::getTableId)
                        .collect(Collectors.toSet()))
                .stream()
                .collect(Collectors.toMap(RestaurantTable::getId, Function.identity()));

        List<SaleResponse> sales = completed.stream().map(order -> new SaleResponse(
                order.getId(), order.getCreatedAt(), order.getUpdatedAt(),
                tableById.get(order.getTableId()) == null
                        ? null : tableById.get(order.getTableId()).getTableNumber(),
                order.getItems().stream().map(item -> new SaleItemResponse(
                        menuById.get(item.getMenuId()) == null
                                ? "Unknown menu item" : menuById.get(item.getMenuId()).getName(),
                        item.getQuantity(), item.getUnitPrice(), item.getSubtotal()
                )).toList(), order.getTotal(), order.getPaymentMethod(),
                order.getAmountPaid(), order.getChangeAmount()
        )).toList();
        BigDecimal totalSales = completed.stream().map(Order::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal averageOrder = completed.isEmpty() ? BigDecimal.ZERO
                : totalSales.divide(BigDecimal.valueOf(completed.size()), 2,
                java.math.RoundingMode.HALF_UP);
        return new HistoryResponse(sales,
                new SummaryResponse(completed.size(), totalSales, averageOrder));
    }

    @Transactional
    public Order updateCompleted(Long id, PaymentMethod paymentMethod, BigDecimal amountPaid) {
        Order order = orders.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found."));
        if (order.getStatus() != OrderStatus.COMPLETED) {
            throw new IllegalStateException("Only completed orders can be edited.");
        }
        if (paymentMethod == null) {
            throw new IllegalArgumentException("Payment method is required.");
        }
        if (amountPaid == null || amountPaid.compareTo(order.getTotal()) < 0) {
            throw new IllegalArgumentException("Amount paid is less than the order total.");
        }
        order.setPaymentMethod(paymentMethod);
        order.setAmountPaid(amountPaid);
        order.setChangeAmount(amountPaid.subtract(order.getTotal()));
        return orders.save(order);
    }

    @Transactional
    public void deleteCompleted(Long id) {
        Order order = orders.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found."));
        if (order.getStatus() != OrderStatus.COMPLETED) {
            throw new IllegalStateException("Only completed orders can be deleted.");
        }
        orders.delete(order);
    }

    public record SaleItemResponse(String name, Integer quantity, BigDecimal unitPrice,
                                   BigDecimal subtotal) {}

    public record SaleResponse(Long id, Instant createdAt, Instant completedAt,
                               Integer tableNumber, List<SaleItemResponse> items,
                               BigDecimal total, Object paymentMethod,
                               BigDecimal amountPaid, BigDecimal changeAmount) {}

    public record SummaryResponse(long orderCount, BigDecimal totalSales,
                                  BigDecimal averageOrder) {}

    public record HistoryResponse(List<SaleResponse> orders,
                                  SummaryResponse summary) {}
}
