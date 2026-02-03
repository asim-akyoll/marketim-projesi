package com.marketim.backend.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    void deleteByRoleNot(Role role);

    @Query(
            value = """
            select *
            from users u
            where u.role = :role
              and (:active is null or u.active = :active)
              and (
                   :q is null
                   or lower(u.first_name) like lower(concat('%', cast(:q as text), '%'))
                   or lower(u.last_name)  like lower(concat('%', cast(:q as text), '%'))
                   or lower(u.email)      like lower(concat('%', cast(:q as text), '%'))
                   or lower(coalesce(u.phone,'')) like lower(concat('%', cast(:q as text), '%'))
              )
            order by u.created_at desc
        """,
            countQuery = """
            select count(*)
            from users u
            where u.role = :role
              and (:active is null or u.active = :active)
              and (
                   :q is null
                   or lower(u.first_name) like lower(concat('%', cast(:q as text), '%'))
                   or lower(u.last_name)  like lower(concat('%', cast(:q as text), '%'))
                   or lower(u.email)      like lower(concat('%', cast(:q as text), '%'))
                   or lower(coalesce(u.phone,'')) like lower(concat('%', cast(:q as text), '%'))
              )
        """,
            nativeQuery = true
    )
    Page<User> searchCustomers(
            @Param("role") String role,
            @Param("q") String q,
            @Param("active") Boolean active,
            Pageable pageable
    );
}
