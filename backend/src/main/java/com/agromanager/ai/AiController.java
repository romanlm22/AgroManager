package com.agromanager.ai;

import com.agromanager.auth.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/farms/{farmId}/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/chat")
    public ChatResponse chat(
            @PathVariable UUID farmId,
            @Valid @RequestBody ChatRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return aiService.chat(farmId, request, userDetails.getUser());
    }
}
