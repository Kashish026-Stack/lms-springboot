package com.lms.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(0) // Run first
public class DatabaseMigration implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            // Alter thumbnail_url column to TEXT type
            jdbcTemplate.execute("ALTER TABLE courses ALTER COLUMN thumbnail_url TYPE TEXT");
            System.out.println("✓ Database migration: thumbnail_url column updated to TEXT");
        } catch (Exception e) {
            // Column might already be TEXT or table doesn't exist yet
            System.out.println("Migration info: " + e.getMessage());
        }
        
        try {
            // Alter description column to TEXT type
            jdbcTemplate.execute("ALTER TABLE courses ALTER COLUMN description TYPE TEXT");
            System.out.println("✓ Database migration: description column updated to TEXT");
        } catch (Exception e) {
            System.out.println("Migration info: " + e.getMessage());
        }
        
        try {
            // Alter category column to be larger too
            jdbcTemplate.execute("ALTER TABLE courses ALTER COLUMN category TYPE TEXT");
            System.out.println("✓ Database migration: category column updated to TEXT");
        } catch (Exception e) {
            System.out.println("Migration info: " + e.getMessage());
        }
        
        try {
            // Clean up corrupted courses with null titles (from previous bugs)
            int deleted = jdbcTemplate.update("DELETE FROM courses WHERE title IS NULL");
            if (deleted > 0) {
                System.out.println("✓ Database cleanup: removed " + deleted + " corrupted course(s)");
            }
        } catch (Exception e) {
            System.out.println("Cleanup info: " + e.getMessage());
        }
    }
}
