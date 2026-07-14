package com.example.demo.repository;

import com.example.demo.model.PortfolioItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PortfolioItemRepository extends JpaRepository<PortfolioItem, Long> {
    List<PortfolioItem> findByCreatorIdOrderByCreatedAtDesc(Long creatorId);
}
