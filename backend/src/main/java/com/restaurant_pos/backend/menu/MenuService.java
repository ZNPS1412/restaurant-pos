package com.restaurant_pos.backend.menu;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service @Transactional
public class MenuService {
    private final MenuRepository repository;
    public MenuService(MenuRepository repository) { this.repository = repository; }
    @Transactional(readOnly = true)
    public List<Menu> findAll() { return repository.findAll(Sort.by("category", "name")); }
    public Menu create(Menu menu) { return repository.save(menu); }
    public Menu update(Long id, Menu input) {
        Menu menu = repository.findById(id).orElseThrow(() -> new MenuNotFoundException(id));
        menu.setName(input.getName()); menu.setCategory(input.getCategory()); menu.setPrice(input.getPrice());
        return repository.save(menu);
    }
    public void delete(Long id) {
        if (!repository.existsById(id)) throw new MenuNotFoundException(id);
        repository.deleteById(id);
    }
    public static class MenuNotFoundException extends RuntimeException {
        public MenuNotFoundException(Long id) { super("Menu item not found: " + id); }
    }
}
