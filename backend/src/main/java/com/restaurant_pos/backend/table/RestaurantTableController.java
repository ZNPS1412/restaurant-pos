package com.restaurant_pos.backend.table;

import jakarta.validation.Valid;
import jakarta.transaction.Transactional;
import com.restaurant_pos.backend.websocket.WebSocketBroadcaster;
import com.restaurant_pos.backend.websocket.WebSocketEvent;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tables")
@CrossOrigin(origins = "*")
public class RestaurantTableController {
    private final RestaurantTableRepository repository;
    private final WebSocketBroadcaster broadcaster;

    public RestaurantTableController(RestaurantTableRepository r, WebSocketBroadcaster b) {
        repository = r;
        broadcaster = b;
    }

    @GetMapping
    public List<RestaurantTable> all() {
        return repository.findAll(org.springframework.data.domain.Sort.by("tableNumber"));
    }

    @PostMapping
    @Transactional
    @ResponseStatus(HttpStatus.CREATED)
    public RestaurantTable create(@Valid @RequestBody RestaurantTable t) {
        t.setStatus(TableStatus.AVAILABLE);
        RestaurantTable saved = repository.save(t);
        notifyTablesChangedAfterCommit();
        return saved;
    }

    @PutMapping("/{id}")
    @Transactional
    public RestaurantTable update(@PathVariable Long id, @Valid @RequestBody RestaurantTable input) {
        RestaurantTable t = repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Table not found."));
        t.setTableNumber(input.getTableNumber());
        RestaurantTable saved = repository.save(t);
        notifyTablesChangedAfterCommit();
        return saved;
    }

    @DeleteMapping("/{id}")
    @Transactional
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        RestaurantTable t = repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Table not found."));
        if (t.getStatus() == TableStatus.OCCUPIED)
            throw new IllegalStateException("Occupied tables cannot be deleted.");
        repository.delete(t);
        notifyTablesChangedAfterCommit();
    }

    private void notifyTablesChangedAfterCommit() {
        Runnable notification = () -> broadcaster.broadcast(new WebSocketEvent("TABLES_CHANGED"));
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    notification.run();
                }
            });
        } else {
            notification.run();
        }
    }
}
