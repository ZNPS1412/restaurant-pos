package com.restaurant_pos.backend.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {
    private final OrderService service;

    public OrderController(OrderService s) {
        service = s;
    }

    public record CreateRequest(@NotNull @Positive Long tableId) {
    }

    public record ItemRequest(@NotNull @Positive Long menuId, @NotNull Integer quantity) {
    }

    public record QuantityRequest(@NotNull Integer quantity) {
    }

    public record TransferRequest(@NotNull @Positive Long tableId) {
    }

    public record CheckoutRequest(@NotNull PaymentMethod paymentMethod,
                                  @NotNull @DecimalMin("0.00") BigDecimal amountPaid) {
    }

    @GetMapping
    public List<Order> all() {
        return service.all();
    }

    @GetMapping("/{id}")
    public Order get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Order create(@Valid @RequestBody CreateRequest r) {
        return service.create(r.tableId());
    }

    @PostMapping("/{id}/items")
    public Order add(@PathVariable Long id, @Valid @RequestBody ItemRequest r) {
        return service.addItem(id, r.menuId(), r.quantity());
    }

    @PutMapping("/{id}/items/{itemId}")
    public Order update(@PathVariable Long id, @PathVariable Long itemId, @Valid @RequestBody QuantityRequest r) {
        return service.updateItem(id, itemId, r.quantity());
    }

    @DeleteMapping("/{id}/items/{itemId}")
    public Order remove(@PathVariable Long id, @PathVariable Long itemId) {
        return service.removeItem(id, itemId);
    }

    @PostMapping("/{id}/transfer")
    public Order transfer(@PathVariable Long id, @Valid @RequestBody TransferRequest r) {
        return service.transfer(id, r.tableId());
    }

    @PostMapping("/{id}/checkout")
    public Order checkout(@PathVariable Long id, @Valid @RequestBody CheckoutRequest r) {
        return service.checkout(id, r.paymentMethod(), r.amountPaid());
    }
}
