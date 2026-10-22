package com.agromanager.livestock;

import com.agromanager.farm.Farm;
import com.agromanager.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductionService {

    private static final LocalDate MIN_DATE = LocalDate.of(1900, 1, 1);
    private static final LocalDate MAX_DATE = LocalDate.of(2999, 12, 31);

    private final LivestockProductionRepository productionRepository;
    private final LivestockAccess access;

    @Transactional
    public ProductionResponse createProduction(UUID farmId, ProductionRequest request, User currentUser) {
        Farm farm = access.getAuthorizedFarm(farmId, currentUser);
        validate(request);

        LivestockProduction production = LivestockProduction.builder()
                .farm(farm)
                .productType(request.productType())
                .productionDate(request.productionDate())
                .quantity(request.quantity())
                .unit(request.unit())
                .herd(access.resolveHerd(farmId, request.herdId()))
                .animal(access.resolveAnimal(farmId, request.animalId()))
                .pricePerUnit(request.pricePerUnit())
                .notes(request.notes())
                .build();

        productionRepository.save(production);

        return ProductionResponse.fromEntity(production);
    }

    /** Del más reciente al más antiguo; las fechas del rango son opcionales e inclusivas. */
    @Transactional(readOnly = true)
    public List<ProductionResponse> getProductions(
            UUID farmId, LocalDate startDate, LocalDate endDate, User currentUser) {

        access.getAuthorizedFarm(farmId, currentUser);

        LocalDate from = startDate != null ? startDate : MIN_DATE;
        LocalDate to = endDate != null ? endDate : MAX_DATE;

        return productionRepository
                .findAllByFarmIdAndProductionDateBetweenOrderByProductionDateDescCreatedAtDesc(farmId, from, to)
                .stream()
                .map(ProductionResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductionResponse getProductionById(UUID farmId, UUID productionId, User currentUser) {
        access.getAuthorizedFarm(farmId, currentUser);

        return ProductionResponse.fromEntity(findProduction(farmId, productionId));
    }

    @Transactional
    public ProductionResponse updateProduction(
            UUID farmId, UUID productionId, ProductionRequest request, User currentUser) {

        access.getAuthorizedFarm(farmId, currentUser);
        validate(request);

        LivestockProduction production = findProduction(farmId, productionId);

        production.setProductType(request.productType());
        production.setProductionDate(request.productionDate());
        production.setQuantity(request.quantity());
        production.setUnit(request.unit());
        production.setHerd(access.resolveHerd(farmId, request.herdId()));
        production.setAnimal(access.resolveAnimal(farmId, request.animalId()));
        production.setPricePerUnit(request.pricePerUnit());
        production.setNotes(request.notes());

        productionRepository.save(production);

        return ProductionResponse.fromEntity(production);
    }

    @Transactional
    public void deleteProduction(UUID farmId, UUID productionId, User currentUser) {
        access.getAuthorizedFarm(farmId, currentUser);

        productionRepository.delete(findProduction(farmId, productionId));
    }

    private LivestockProduction findProduction(UUID farmId, UUID productionId) {
        return productionRepository.findByIdAndFarmId(productionId, farmId)
                .orElseThrow(() -> new NoSuchElementException("Production record not found"));
    }

    private void validate(ProductionRequest request) {
        if (request.herdId() != null && request.animalId() != null) {
            throw new InvalidLivestockRequestException("Production can be linked to a herd or an animal, not both");
        }
    }
}
