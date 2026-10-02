package com.restaurant_pos.backend.menu;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/menus") @CrossOrigin(origins = "*")
public class MenuController {
    private final MenuService service;
    public MenuController(MenuService service) { this.service = service; }
    @GetMapping public List<Menu> findAll() { return service.findAll(); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public Menu create(@Valid @RequestBody Menu menu) { return service.create(menu); }
    @PutMapping("/{id}")
    public Menu update(@PathVariable Long id, @Valid @RequestBody Menu menu) { return service.update(id, menu); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.delete(id); }
}
