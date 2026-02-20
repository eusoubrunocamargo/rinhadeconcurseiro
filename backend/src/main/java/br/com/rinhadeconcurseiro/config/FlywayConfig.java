package br.com.rinhadeconcurseiro.config;

import org.flywaydb.core.Flyway;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class FlywayConfig {

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            System.out.println("=== FLYWAY: Iniciando migração ===");
            System.out.println("=== FLYWAY: Locations = " + String.join(", ", flyway.getConfiguration().getLocations().toString()));
            flyway.migrate();
            System.out.println("=== FLYWAY: Migração concluída ===");
        };
    }
}