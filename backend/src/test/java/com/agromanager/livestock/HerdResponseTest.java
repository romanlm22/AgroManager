package com.agromanager.livestock;

import com.agromanager.farm.Farm;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class HerdResponseTest {

    private Herd herdWithManualCount(int manualHeadCount) {
        return Herd.builder()
                .id(UUID.randomUUID())
                .farm(Farm.builder().id(UUID.randomUUID()).build())
                .name("Vacas de cría")
                .category(LivestockCategory.VACA)
                .manualHeadCount(manualHeadCount)
                .build();
    }

    @Test
    void usesTheManualCountWhenThereAreNoTrackedAnimals() {
        HerdResponse response = HerdResponse.fromEntity(herdWithManualCount(40), 0);

        assertThat(response.headCount()).isEqualTo(40);
        assertThat(response.headCountMode()).isEqualTo(HeadCountMode.MANUAL);
    }

    @Test
    void usesTheTrackedAnimalsWhenThereAreAny() {
        HerdResponse response = HerdResponse.fromEntity(herdWithManualCount(40), 12);

        assertThat(response.headCount()).isEqualTo(12);
        assertThat(response.trackedAnimals()).isEqualTo(12);
        assertThat(response.headCountMode()).isEqualTo(HeadCountMode.FICHAS);
    }
}
