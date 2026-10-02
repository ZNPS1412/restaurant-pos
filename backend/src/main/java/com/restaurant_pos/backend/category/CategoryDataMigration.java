package com.restaurant_pos.backend.category;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class CategoryDataMigration {
    private final JdbcTemplate jdbc;

    public CategoryDataMigration(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void migrateLegacyCategories() {
        jdbc.execute("ALTER TABLE menus ALTER COLUMN category DROP NOT NULL");
        jdbc.update("""
            INSERT INTO categories (name)
            SELECT DISTINCT TRIM(category) FROM menus
            WHERE category IS NOT NULL AND TRIM(category) <> ''
            ON CONFLICT (name) DO NOTHING
            """);
        jdbc.update("""
            UPDATE menus m SET category_id = c.id
            FROM categories c
            WHERE m.category_id IS NULL AND LOWER(TRIM(m.category)) = LOWER(c.name)
            """);
    }
}
