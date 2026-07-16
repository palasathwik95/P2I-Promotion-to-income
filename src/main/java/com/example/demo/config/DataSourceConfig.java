package com.example.demo.config;

import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;
import java.sql.Connection;

@Configuration
public class DataSourceConfig {

    private final Environment env;
    private final Logger logger = LoggerFactory.getLogger(DataSourceConfig.class);

    public DataSourceConfig(Environment env) {
        this.env = env;
    }

    @Bean
    @Primary
    public DataSource dataSource() {
        String url = env.getProperty("spring.datasource.url");
        String username = env.getProperty("spring.datasource.username");
        String password = env.getProperty("spring.datasource.password");
        String driverClassName = env.getProperty("spring.datasource.driver-class-name");

        HikariDataSource mysqlDataSource = new HikariDataSource();
        mysqlDataSource.setJdbcUrl(url);
        mysqlDataSource.setUsername(username);
        mysqlDataSource.setPassword(password);
        mysqlDataSource.setDriverClassName(driverClassName);
        mysqlDataSource.setMaximumPoolSize(10);
        mysqlDataSource.setConnectionTimeout(10000);
        mysqlDataSource.setPoolName("P2I-MySQL-Pool");

        try (Connection ignored = mysqlDataSource.getConnection()) {
            logger.info("Connected to primary datasource successfully: {}", url);
            return mysqlDataSource;
        } catch (Exception ex) {
            logger.warn("Unable to connect to MySQL datasource, falling back to embedded H2.", ex);
            mysqlDataSource.close();
            return buildH2DataSource();
        }
    }

    private DataSource buildH2DataSource() {
        HikariDataSource h2 = new HikariDataSource();
        h2.setJdbcUrl("jdbc:h2:mem:p2i;MODE=MySQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE");
        h2.setUsername("sa");
        h2.setPassword("");
        h2.setDriverClassName("org.h2.Driver");
        h2.setMaximumPoolSize(5);
        h2.setPoolName("P2I-H2-Pool");
        return h2;
    }
}
