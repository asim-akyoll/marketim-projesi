package com.marketim.backend.stock;

import com.marketim.backend.product.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StockMovementService {

    private final StockMovementRepository stockMovementRepository;

    @Transactional(readOnly = true)
    public Page<StockMovementResponse> getByProduct(Long productId, Pageable pageable) {
        return stockMovementRepository.findByProductId(productId, pageable)
                .map(this::toResponse);
    }

    @Transactional
    public void log(Product product,
                    StockMovementType type,
                    int delta,
                    int beforeStock,
                    int afterStock,
                    String referenceType,
                    Long referenceId,
                    String note,
                    String actor) {

        StockMovement m = StockMovement.builder()
                .product(product)
                .type(type)
                .delta(delta)
                .beforeStock(beforeStock)
                .afterStock(afterStock)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .note(note)
                .actor(actor)
                .build();

        stockMovementRepository.save(m);
    }

    private StockMovementResponse toResponse(StockMovement m) {
        return StockMovementResponse.builder()
                .id(m.getId())
                .productId(m.getProduct().getId())
                .productName(m.getProduct().getName())
                .type(m.getType())
                .delta(m.getDelta())
                .beforeStock(m.getBeforeStock())
                .afterStock(m.getAfterStock())
                .referenceType(m.getReferenceType())
                .referenceId(m.getReferenceId())
                .note(m.getNote())
                .actor(m.getActor())
                .createdAt(m.getCreatedAt())
                .build();
    }
}

