package com.restaurant_pos.backend.category;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class CategoryController {
    private final CategoryService service;

    public CategoryController(CategoryService service) { this.service = service; }
    @GetMapping public List<Category> findAll() { return service.findAll(); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public Category create(@Valid @RequestBody Category category) { return service.create(category); }
    @PutMapping("/{id}")
    public Category update(@PathVariable Long id, @Valid @RequestBody Category category) { return service.update(id, category); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.delete(id); }
}
