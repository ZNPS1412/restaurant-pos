package com.restaurant_pos.backend.orderitem;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.restaurant_pos.backend.order.Order; import jakarta.persistence.*; import java.math.BigDecimal;
@Entity @Table(name="order_items")
public class OrderItem {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @JsonIgnore @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="order_id",nullable=false) private Order order;
 @Column(nullable=false) private Long menuId; @Column(nullable=false) private Integer quantity; @Column(nullable=false,precision=12,scale=2) private BigDecimal unitPrice; @Column(nullable=false,precision=12,scale=2) private BigDecimal subtotal;
 public OrderItem(){} public Long getId(){return id;} public Order getOrder(){return order;} public void setOrder(Order v){order=v;} public Long getMenuId(){return menuId;} public void setMenuId(Long v){menuId=v;} public Integer getQuantity(){return quantity;} public void setQuantity(Integer v){quantity=v;} public BigDecimal getUnitPrice(){return unitPrice;} public void setUnitPrice(BigDecimal v){unitPrice=v;} public BigDecimal getSubtotal(){return subtotal;} public void setSubtotal(BigDecimal v){subtotal=v;}
}
