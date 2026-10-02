package com.restaurant_pos.backend.table;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
@Entity @Table(name = "restaurant_tables")
public class RestaurantTable {
 @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
 @NotNull @Positive @Column(nullable=false, unique=true) private Integer tableNumber;
 @Enumerated(EnumType.STRING) @Column(nullable=false, length=20) private TableStatus status=TableStatus.AVAILABLE;
 protected RestaurantTable() {}
 public Long getId(){return id;} public Integer getTableNumber(){return tableNumber;} public void setTableNumber(Integer v){tableNumber=v;}
 public TableStatus getStatus(){return status;} public void setStatus(TableStatus v){status=v;}
}
