package com.marketim.backend.order;

import com.marketim.backend.user.User;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;


public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    // USER: kendi siparişlerini listelerken item + product'ı tek seferde çek
    @Query("""
        select distinct o
        from Order o
        left join fetch o.items i
        left join fetch i.product p
        where o.user = :user
        order by o.id desc
    """)
    List<Order> findByUserWithItems(User user);

    // ADMIN: order detail için item + product'ı tek seferde çek
    @Query("""
        select distinct o from Order o
        left join fetch o.user
        left join fetch o.items i
        left join fetch i.product p
        where o.id = :id
    """)
    Optional<Order> findByIdWithItems(@Param("id") Long id);

    // ADMIN: status bazlı sayaçlar (mini counter'lar) için
    @Query("""
        select o.status as status, count(o) as cnt
        from Order o
        group by o.status
    """)
    List<OrderStatusCount> countByStatusGroup();

    // ADMIN: tüm siparişleri (eski yöntem) item + product ile çek


    // DASHBOARD - bugünkü sipariş sayısı
    @Query("""
    select count(o)
    from Order o
    where o.createdAt >= :start and o.createdAt <= :end
""")
    long countByCreatedAtBetween(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    // DASHBOARD - tarih aralığına göre toplam ciro
    @Query("""
    select coalesce(sum(o.totalAmount), 0)
    from Order o
    where o.createdAt >= :start and o.createdAt <= :end
""")
    BigDecimal sumTotalAmountBetween(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    // DASHBOARD - son 5 sipariş (admin)
    @Query("""
    select o
    from Order o
    join fetch o.user
    order by o.createdAt desc
""")
    List<Order> findRecentOrders(Pageable pageable);

    @Query("""
    select o.status as status, count(o) as cnt
    from Order o
    where o.createdAt >= :start and o.createdAt <= :end
    group by o.status
""")
    List<OrderStatusCountByRange> countByStatusGroupBetween(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("""
    select distinct o
    from Order o
    left join fetch o.items i
    left join fetch i.product p
    where o.id = :id and o.user = :user
""")
    Optional<Order> findByIdAndUserWithItems(@Param("id") Long id, @Param("user") User user);

    @Query(
            value = """
        select o
        from Order o
        join fetch o.user u
        where u.id = :userId
    """,
            countQuery = """
        select count(o)
        from Order o
        where o.user.id = :userId
    """
    )
    Page<Order> findPageByUserIdWithUser(@Param("userId") Long userId, Pageable pageable);

    @Query("""
    select o
    from Order o
    left join fetch o.user u
    where o.createdAt >= :start and o.createdAt <= :end
    order by o.createdAt desc
""")
    List<Order> findOrdersForReport(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );


    @Query("""
  select count(o)
  from Order o
  where o.createdAt >= :start and o.createdAt <= :end
    and o.status = :status
""")
    long countByCreatedAtBetweenAndStatus(@Param("start") LocalDateTime start,
                                          @Param("end") LocalDateTime end,
                                          @Param("status") com.marketim.backend.order.OrderStatus status);

    @Query("""
  select coalesce(sum(o.totalAmount), 0)
  from Order o
  where o.createdAt >= :start and o.createdAt <= :end
""")
    java.math.BigDecimal sumTotalAmountByCreatedAtBetween(@Param("start") LocalDateTime start,
                                                          @Param("end") LocalDateTime end);


    // order/OrderRepository.java

    public interface RevenueByDayProjection {
        LocalDate getDay();
        BigDecimal getTotal();
    }

    @Query("""
    select
      function('date', o.createdAt) as day,
      coalesce(sum(o.totalAmount), 0) as total
    from Order o
    where o.createdAt >= :start and o.createdAt < :end
    group by function('date', o.createdAt)
    order by day
""")
    List<RevenueByDayProjection> sumRevenueByDay(@Param("start") LocalDateTime start,
                                                 @Param("end") LocalDateTime end);



}
