package com.marketim.backend.order;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    interface OrderItemCountProjection {
        Long getOrderId();
        Long getCnt();
    }

    @Query("""
        select i.order.id as orderId, count(i) as cnt
        from OrderItem i
        where i.order.id in :orderIds
        group by i.order.id
    """)
    List<OrderItemCountProjection> countItemsByOrderIds(@Param("orderIds") List<Long> orderIds);
}
