package com.restaurant_pos.backend.category;

import com.restaurant_pos.backend.menu.MenuRepository;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CategoryService {
    private final CategoryRepository repository;
    private final MenuRepository menus;

    public CategoryService(CategoryRepository repository, MenuRepository menus) {
        this.repository = repository;
        this.menus = menus;
    }

    @Transactional(readOnly = true)
    public List<Category> findAll() { return repository.findAll(Sort.by("name")); }

    public Category create(Category input) {
        String name = clean(input.getName());
        if (repository.existsByNameIgnoreCase(name)) throw new IllegalArgumentException("Category already exists.");
        return repository.save(new Category(name));
    }

    public Category update(Long id, Category input) {
        Category category = find(id);
        String name = clean(input.getName());
        if (repository.findByNameIgnoreCase(name).filter(other -> !other.getId().equals(id)).isPresent()) {
            throw new IllegalArgumentException("Category already exists.");
        }
        category.setName(name);
        return repository.save(category);
    }

    public void delete(Long id) {
        Category category = find(id);
        if (menus.existsByCategoryId(id)) throw new IllegalStateException("Category is used by menu items.");
        repository.delete(category);
    }

    private Category find(Long id) {
        return repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Category not found."));
    }

    private String clean(String name) {
        if (name == null || name.trim().isEmpty()) throw new IllegalArgumentException("Category name is required.");
        return name.trim();
    }
}
