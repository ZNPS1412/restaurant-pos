package com.restaurant_pos.backend.table;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/tables") @CrossOrigin(origins="*")
public class RestaurantTableController {
 private final RestaurantTableRepository repository;
 public RestaurantTableController(RestaurantTableRepository r){repository=r;}
 @GetMapping public List<RestaurantTable> all(){return repository.findAll(org.springframework.data.domain.Sort.by("tableNumber"));}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public RestaurantTable create(@Valid @RequestBody RestaurantTable t){t.setStatus(TableStatus.AVAILABLE);return repository.save(t);}
 @PutMapping("/{id}") public RestaurantTable update(@PathVariable Long id,@Valid @RequestBody RestaurantTable input){RestaurantTable t=repository.findById(id).orElseThrow(()->new IllegalArgumentException("Table not found."));t.setTableNumber(input.getTableNumber());return repository.save(t);}
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id){RestaurantTable t=repository.findById(id).orElseThrow(()->new IllegalArgumentException("Table not found."));if(t.getStatus()==TableStatus.OCCUPIED)throw new IllegalStateException("Occupied tables cannot be deleted.");repository.delete(t);}
}
