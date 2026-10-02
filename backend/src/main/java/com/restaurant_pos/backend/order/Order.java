package com.restaurant_pos.backend.order;
import com.restaurant_pos.backend.orderitem.OrderItem;
import jakarta.persistence.*;
import java.math.*; import java.time.Instant; import java.util.*;
@Entity @Table(name="orders")
public class Order {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false) private Long tableId;
 @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private OrderStatus status=OrderStatus.OPEN;
 @Column(nullable=false,precision=12,scale=2) private BigDecimal total=BigDecimal.ZERO;
 @Enumerated(EnumType.STRING) @Column(length=20) private PaymentMethod paymentMethod;
 @Column(precision=12,scale=2) private BigDecimal amountPaid;
 @Column(precision=12,scale=2) private BigDecimal changeAmount;
 @Column(nullable=false) private Instant createdAt; @Column(nullable=false) private Instant updatedAt;
 @OneToMany(mappedBy="order",cascade=CascadeType.ALL,orphanRemoval=true) private List<OrderItem> items=new ArrayList<>();
 protected Order(){} @PrePersist void created(){createdAt=Instant.now();updatedAt=createdAt;} @PreUpdate void changed(){updatedAt=Instant.now();}
 public Long getId(){return id;} public Long getTableId(){return tableId;} public void setTableId(Long v){tableId=v;} public OrderStatus getStatus(){return status;} public void setStatus(OrderStatus v){status=v;} public BigDecimal getTotal(){return total;} public void setTotal(BigDecimal v){total=v;} public Instant getCreatedAt(){return createdAt;} public Instant getUpdatedAt(){return updatedAt;} public List<OrderItem> getItems(){return items;}
 public PaymentMethod getPaymentMethod(){return paymentMethod;} public void setPaymentMethod(PaymentMethod v){paymentMethod=v;} public BigDecimal getAmountPaid(){return amountPaid;} public void setAmountPaid(BigDecimal v){amountPaid=v;} public BigDecimal getChangeAmount(){return changeAmount;} public void setChangeAmount(BigDecimal v){changeAmount=v;}
}
