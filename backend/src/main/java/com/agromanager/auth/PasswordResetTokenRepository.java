package com.agromanager.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {

    List<PasswordResetToken> findAllByUserIdAndUsedAtIsNull(UUID userId);

    @Modifying
    @Query("UPDATE PasswordResetToken t SET t.usedAt = CURRENT_TIMESTAMP " +
           "WHERE t.user.id = :userId AND t.usedAt IS NULL")
    void invalidateAllActiveTokensForUser(UUID userId);
}