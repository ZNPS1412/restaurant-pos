package com.restaurant_pos.backend.menu;

import com.restaurant_pos.backend.category.Category;
import com.restaurant_pos.backend.category.CategoryRepository;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MenuService {
    private final MenuRepository repository;
    private final CategoryRepository categories;

    public MenuService(MenuRepository repository, CategoryRepository categories) {
        this.repository = repository;
        this.categories = categories;
    }

    @Transactional(readOnly = true)
    public List<Menu> findAll() { return repository.findAll(Sort.by("category", "name")); }
    public Menu create(Menu menu) { menu.setCategory(category(menu.getCategory())); return repository.save(menu); }
    public Menu update(Long id, Menu input) {
        Menu menu = repository.findById(id).orElseThrow(() -> new MenuNotFoundException(id));
        menu.setName(input.getName());
        menu.setCategory(category(input.getCategory()));
        menu.setPrice(input.getPrice());
        return repository.save(menu);
    }
    private Category category(Category input) {
        if (input == null || input.getId() == null) throw new IllegalArgumentException("Category is required.");
        return categories.findById(input.getId()).orElseThrow(() -> new IllegalArgumentException("Category not found."));
    }
    public void delete(Long id) {
        if (!repository.existsById(id)) throw new MenuNotFoundException(id);
        repository.deleteById(id);
    }
    public static class MenuNotFoundException extends RuntimeException {
        public MenuNotFoundException(Long id) { super("Menu item not found: " + id); }
    }
}
