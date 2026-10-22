package com.agromanager.livestock;

import com.agromanager.farm.Farm;
import com.agromanager.farm.FarmAccessDeniedException;
import com.agromanager.farm.FarmRepository;
import com.agromanager.farm.FarmUserRepository;
import com.agromanager.field.FieldRepository;
import com.agromanager.user.Role;
import com.agromanager.user.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LivestockAccessTest {

    @Mock
    private FarmRepository farmRepository;

    @Mock
    private FarmUserRepository farmUserRepository;

    @Mock
    private FieldRepository fieldRepository;

    @Mock
    private HerdRepository herdRepository;

    @Mock
    private AnimalRepository animalRepository;

    @InjectMocks
    private LivestockAccess access;

    private final UUID farmId = UUID.randomUUID();

    private User user() {
        return User.builder()
                .id(UUID.randomUUID())
                .email("ana@mail.com")
                .passwordHash("hash")
                .firstName("Ana")
                .lastName("Perez")
                .role(Role.PRODUCER)
                .enabled(true)
                .build();
    }

    @Test
    void getAuthorizedFarm_deniesUsersThatDoNotBelongToTheFarm() {
        User user = user();
        when(farmUserRepository.existsByFarmIdAndUserId(farmId, user.getId())).thenReturn(false);

        assertThatThrownBy(() -> access.getAuthorizedFarm(farmId, user))
                .isInstanceOf(FarmAccessDeniedException.class);

        verifyNoInteractions(farmRepository);
    }

    @Test
    void getAuthorizedFarm_returnsTheFarmForMembers() {
        User user = user();
        Farm farm = Farm.builder().id(farmId).name("La Esperanza").build();
        when(farmUserRepository.existsByFarmIdAndUserId(farmId, user.getId())).thenReturn(true);
        when(farmRepository.findById(farmId)).thenReturn(Optional.of(farm));

        assertThat(access.getAuthorizedFarm(farmId, user)).isSameAs(farm);
    }

    @Test
    void getAuthorizedFarm_reportsNotFoundWhenTheFarmDoesNotExist() {
        User user = user();
        when(farmUserRepository.existsByFarmIdAndUserId(farmId, user.getId())).thenReturn(true);
        when(farmRepository.findById(farmId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> access.getAuthorizedFarm(farmId, user))
                .isInstanceOf(NoSuchElementException.class);
    }

    @Test
    void resolveHerd_returnsNullWhenNoHerdWasGiven() {
        assertThat(access.resolveHerd(farmId, null)).isNull();

        verifyNoInteractions(herdRepository);
    }

    @Test
    void resolveHerd_hidesHerdsOfOtherFarms() {
        UUID herdId = UUID.randomUUID();
        when(herdRepository.findByIdAndFarmId(herdId, farmId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> access.resolveHerd(farmId, herdId))
                .isInstanceOf(NoSuchElementException.class);
    }

    @Test
    void resolveAnimal_returnsNullWhenNoAnimalWasGiven() {
        assertThat(access.resolveAnimal(farmId, null)).isNull();

        verifyNoInteractions(animalRepository);
    }

    @Test
    void resolveAnimal_hidesAnimalsOfOtherFarms() {
        UUID animalId = UUID.randomUUID();
        when(animalRepository.findByIdAndFarmId(animalId, farmId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> access.resolveAnimal(farmId, animalId))
                .isInstanceOf(NoSuchElementException.class);
    }

    @Test
    void resolveField_returnsNullWhenNoFieldWasGiven() {
        assertThat(access.resolveField(farmId, null)).isNull();

        verifyNoInteractions(fieldRepository);
    }
}
