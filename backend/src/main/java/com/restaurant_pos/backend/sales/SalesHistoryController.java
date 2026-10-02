package com.restaurant_pos.backend.sales;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.time.Instant;
import java.util.List;
import java.math.BigDecimal;
import com.restaurant_pos.backend.order.Order;
import com.restaurant_pos.backend.order.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/sales-history")
@CrossOrigin(origins = "*")
public class SalesHistoryController {
    private final SalesHistoryService service;

    public SalesHistoryController(SalesHistoryService service) {
        this.service = service;
    }

    @GetMapping
    public SalesHistoryService.HistoryResponse list(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to) {
        if (!from.isBefore(to)) {
            throw new IllegalArgumentException("The date range is invalid.");
        }
        return service.findCompleted(from, to);
    }

    public record EditRequest(@NotNull PaymentMethod paymentMethod,
                              @NotNull @DecimalMin("0.00") BigDecimal amountPaid) {
    }

    @PutMapping("/orders/{id}")
    public Order edit(@PathVariable Long id, @Valid @RequestBody EditRequest request) {
        return service.updateCompleted(id, request.paymentMethod(), request.amountPaid());
    }

    @DeleteMapping("/orders/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.deleteCompleted(id);
    }
}
