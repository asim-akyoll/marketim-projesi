package com.marketim.backend.product;

import com.marketim.backend.category.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    List<Product> findByCategoryAndActiveTrue(Category category);

    boolean existsByCategoryId(Long categoryId);

    List<Product> findByActiveTrue();

    List<Product> findByNameContainingIgnoreCaseAndActiveTrue(String name);

    // Order sırasında ürün+kategori kontrolü için
    @Query("""
        select p
        from Product p
        left join fetch p.category c
        where p.id = :id
    """)
    Optional<Product> findByIdWithCategory(@Param("id") Long id);

    // ATOMIC: stok düş (aktif ürün şartı + stock>=qty şartı)
    @Modifying
    @Transactional
    @Query("""
        update Product p
        set p.stock = p.stock - :qty
        where p.id = :id
          and p.active = true
          and p.stock >= :qty
    """)
    int decreaseStockIfAvailable(@Param("id") Long id, @Param("qty") int qty);

    // ATOMIC: stok iade (aktif/pasif fark etmez)
    @Modifying
    @Transactional
    @Query("""
        update Product p
        set p.stock = p.stock + :qty
        where p.id = :id
    """)
    int increaseStock(@Param("id") Long id, @Param("qty") int qty);

    Page<Product> findByStockLessThanEqual(Integer threshold, Pageable pageable);

    Page<Product> findByActiveTrueAndStockLessThanEqual(Integer threshold, Pageable pageable);

    @Query("""
    select p
    from Product p
    where p.active = true
    order by lower(p.name) asc
    """)
    List<Product> findAllActiveForStockReport();

}
