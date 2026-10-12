package com.agromanager.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ChatMessage(

        @NotNull(message = "Role is required")
        ChatRole role,

        @NotBlank(message = "Content is required")
        @Size(max = 2000, message = "Message must be at most 2000 characters")
        String content
) {}
