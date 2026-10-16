package com.restaurant_pos.backend.order;

import com.restaurant_pos.backend.menu.*;
import com.restaurant_pos.backend.orderitem.OrderItem;
import com.restaurant_pos.backend.table.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import com.restaurant_pos.backend.websocket.WebSocketBroadcaster;
import com.restaurant_pos.backend.websocket.WebSocketEvent;

import java.math.*;
import java.util.*;

@Service
public class OrderService {
    private final OrderRepository orders;
    private final RestaurantTableRepository tables;
    private final MenuRepository menus;
    private final WebSocketBroadcaster broadcaster;

    public OrderService(OrderRepository o, RestaurantTableRepository t, MenuRepository m,
                        WebSocketBroadcaster b) {
        orders = o;
        tables = t;
        menus = m;
        broadcaster = b;
    }

    public List<Order> all() {
        return orders.findAll();
    }

    public Order get(Long id) {
        return orders.findById(id).orElseThrow(() -> new IllegalArgumentException("Order not found."));
    }

    @Transactional
    public Order create(Long tableId) {
        RestaurantTable t = tableForUpdate(tableId);
        List<Order> existing = orders.findByTableIdAndStatusForUpdate(tableId, OrderStatus.OPEN);
        if (existing.size() > 1) throw new IllegalStateException("Table has multiple active orders.");
        if (!existing.isEmpty()) return existing.get(0);
        if (t.getStatus() != TableStatus.AVAILABLE) throw new IllegalStateException("Table is occupied.");
        Order o = new Order();
        o.setTableId(tableId);
        tables.save(t);
        Order saved = orders.save(o);
        notifyTablesChangedAfterCommit();
        return saved;
    }

    @Transactional
    public Order addItem(Long id, Long menuId, int quantity) {
        if (quantity <= 0) throw new IllegalArgumentException("Quantity must be positive.");
        Order o = openAfterTableLock(id);
        Menu m = menus.findById(menuId).orElseThrow(() -> new IllegalArgumentException("Menu item not found."));
        OrderItem i = o.getItems().stream().filter(x -> x.getMenuId().equals(menuId)).findFirst().orElseGet(() -> {
            OrderItem x = new OrderItem();
            x.setOrder(o);
            x.setMenuId(menuId);
            x.setUnitPrice(m.getPrice());
            o.getItems().add(x);
            return x;
        });
        i.setQuantity((i.getQuantity() == null ? 0 : i.getQuantity()) + quantity);
        recalc(o);
        syncTable(o);
        Order saved = orders.save(o);
        notifyTablesChangedAfterCommit();
        return saved;
    }

    @Transactional
    public Order updateItem(Long id, Long itemId, int quantity) {
        Order o = openAfterTableLock(id);
        OrderItem i = item(o, itemId);
        if (quantity <= 0) o.getItems().remove(i);
        else i.setQuantity(quantity);
        recalc(o);
        syncTable(o);
        Order saved = orders.save(o);
        notifyTablesChangedAfterCommit();
        return saved;
    }

    @Transactional
    public Order removeItem(Long id, Long itemId) {
        Order o = openAfterTableLock(id);
        o.getItems().remove(item(o, itemId));
        recalc(o);
        syncTable(o);
        Order saved = orders.save(o);
        notifyTablesChangedAfterCommit();
        return saved;
    }

    @Transactional
    public Order transfer(Long id, Long targetId) {
        Order current = get(id);
        if (current.getTableId().equals(targetId)) throw new IllegalStateException("Choose a different table.");
        Long sourceId = current.getTableId();
        RestaurantTable from;
        RestaurantTable to;
        if (sourceId < targetId) {
            from = tableForUpdate(sourceId);
            to = tableForUpdate(targetId);
        } else {
            to = tableForUpdate(targetId);
            from = tableForUpdate(sourceId);
        }
        Order o = openForUpdate(id);
        if (!o.getTableId().equals(sourceId)) {
            throw new IllegalStateException("Order moved while the transfer was starting. Retry the transfer.");
        }
        if (o.getTableId().equals(targetId)) {
            throw new IllegalStateException("Choose a different table.");
        }
        List<Order> targetOrders = orders.findByTableIdAndStatusForUpdate(targetId, OrderStatus.OPEN);
        if (targetOrders.size() > 1) {
            throw new IllegalStateException("Destination table has multiple active orders.");
        }

        Order targetOrder = to.getStatus() == TableStatus.OCCUPIED
                ? (targetOrders.isEmpty() ? null : targetOrders.get(0))
                : null;
        if (to.getStatus() == TableStatus.OCCUPIED && targetOrder == null) {
            throw new IllegalStateException("Occupied destination has no active order.");
        }
        if (targetOrder == null) {
            from.setStatus(TableStatus.AVAILABLE);
            to.setStatus(o.getItems().isEmpty() ? TableStatus.AVAILABLE : TableStatus.OCCUPIED);
            o.setTableId(targetId);
        } else {
            // PostgreSQL unique indexes are immediate. Move both rows to unique
            // temporary keys before assigning the two occupied tables.
            orders.moveOrdersToUniqueTemporaryTables(o.getId(), targetOrder.getId());
            orders.completeOrderSwap(o.getId(), to.getId(), targetOrder.getId(), from.getId());
            targetOrder.setTableId(from.getId());
            o.setTableId(to.getId());
            from.setStatus(targetOrder.getItems().isEmpty() ? TableStatus.AVAILABLE : TableStatus.OCCUPIED);
            to.setStatus(o.getItems().isEmpty() ? TableStatus.AVAILABLE : TableStatus.OCCUPIED);
            orders.save(targetOrder);
        }
        tables.save(from);
        tables.save(to);
        Order saved = orders.save(o);
        notifyTablesChangedAfterCommit();
        return saved;
    }

    @Transactional
    public Order checkout(Long id, PaymentMethod method, BigDecimal amountPaid) {
        Order o = openAfterTableLock(id);
        if (method == null) throw new IllegalArgumentException("Payment method is required.");
        if (o.getItems().isEmpty()) throw new IllegalStateException("Cannot checkout an empty order.");
        if (amountPaid == null || amountPaid.compareTo(o.getTotal()) < 0)
            throw new IllegalArgumentException("Amount paid is less than the order total.");
        RestaurantTable t = table(o.getTableId());
        o.setPaymentMethod(method);
        o.setAmountPaid(amountPaid);
        o.setChangeAmount(amountPaid.subtract(o.getTotal()));
        o.setStatus(OrderStatus.COMPLETED);
        t.setStatus(TableStatus.AVAILABLE);
        tables.save(t);
        Order saved = orders.save(o);
        notifyTablesChangedAfterCommit();
        return saved;
    }

    @Transactional
    public Order partialCheckout(Long id, PaymentMethod method, BigDecimal amountPaid,
                                 Map<Long, Integer> selectedQuantities) {
        Order source = openAfterTableLock(id);
        if (method == null) throw new IllegalArgumentException("Payment method is required.");
        if (selectedQuantities == null || selectedQuantities.isEmpty()) {
            throw new IllegalArgumentException("Select at least one item to checkout.");
        }

        List<OrderItem> selectedItems = new ArrayList<>();
        for (Map.Entry<Long, Integer> entry : selectedQuantities.entrySet()) {
            OrderItem sourceItem = item(source, entry.getKey());
            int quantity = entry.getValue() == null ? 0 : entry.getValue();
            if (quantity <= 0 || quantity > sourceItem.getQuantity()) {
                throw new IllegalArgumentException("Selected quantity is invalid.");
            }
            OrderItem saleItem = new OrderItem();
            saleItem.setMenuId(sourceItem.getMenuId());
            saleItem.setQuantity(quantity);
            saleItem.setUnitPrice(sourceItem.getUnitPrice());
            saleItem.setSubtotal(sourceItem.getUnitPrice().multiply(BigDecimal.valueOf(quantity)));
            selectedItems.add(saleItem);
        }

        BigDecimal saleTotal = selectedItems.stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (amountPaid == null || amountPaid.compareTo(saleTotal) < 0) {
            throw new IllegalArgumentException("Amount paid is less than the selected sale total.");
        }

        for (Map.Entry<Long, Integer> entry : selectedQuantities.entrySet()) {
            OrderItem sourceItem = item(source, entry.getKey());
            int remaining = sourceItem.getQuantity() - entry.getValue();
            if (remaining == 0) source.getItems().remove(sourceItem);
            else sourceItem.setQuantity(remaining);
        }
        recalc(source);
        if (source.getItems().isEmpty()) {
            throw new IllegalArgumentException("Use full checkout when selling the entire order.");
        }
        syncTable(source);

        Order sale = new Order();
        sale.setTableId(source.getTableId());
        sale.setStatus(OrderStatus.COMPLETED);
        sale.setTotal(saleTotal);
        sale.setPaymentMethod(method);
        sale.setAmountPaid(amountPaid);
        sale.setChangeAmount(amountPaid.subtract(saleTotal));
        selectedItems.forEach(item -> {
            item.setOrder(sale);
            sale.getItems().add(item);
        });

        orders.save(source);
        orders.save(sale);
        notifyTablesChangedAfterCommit();
        return source;
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

    private void syncTable(Order o) {
        RestaurantTable table = table(o.getTableId());
        table.setStatus(o.getItems().isEmpty() ? TableStatus.AVAILABLE : TableStatus.OCCUPIED);
        tables.save(table);
    }

    private Order open(Long id) {
        Order o = get(id);
        if (o.getStatus() != OrderStatus.OPEN) throw new IllegalStateException("Order is not open.");
        return o;
    }

    private Order openAfterTableLock(Long id) {
        RestaurantTable table = tables.findByOrderIdForUpdate(id);
        if (table == null) throw new IllegalArgumentException("Order not found.");
        return openForUpdate(id);
    }

    private Order openForUpdate(Long id) {
        Order o = orders.findByIdForUpdate(id).orElseThrow(() -> new IllegalArgumentException("Order not found."));
        if (o.getStatus() != OrderStatus.OPEN) throw new IllegalStateException("Order is not open.");
        return o;
    }

    private RestaurantTable table(Long id) {
        return tables.findById(id).orElseThrow(() -> new IllegalArgumentException("Table not found."));
    }

    private RestaurantTable tableForUpdate(Long id) {
        RestaurantTable table = tables.findByIdForUpdate(id);
        if (table == null) throw new IllegalArgumentException("Table not found.");
        return table;
    }

    private OrderItem item(Order o, Long id) {
        return o.getItems().stream().filter(i -> i.getId().equals(id)).findFirst().orElseThrow(() -> new IllegalArgumentException("Order item not found."));
    }

    private void recalc(Order o) {
        o.getItems().forEach(i -> i.setSubtotal(i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity()))));
        o.setTotal(o.getItems().stream().map(OrderItem::getSubtotal).reduce(BigDecimal.ZERO, BigDecimal::add));
    }
}
