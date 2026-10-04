package com.agromanager.task;

import com.agromanager.auth.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/farms/{farmId}/fields/{fieldId}/tasks")
@RequiredArgsConstructor
public class AgriculturalTaskController {

    private final AgriculturalTaskService taskService;

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @PathVariable UUID farmId,
            @PathVariable UUID fieldId,
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        TaskResponse response = taskService.createTask(farmId, fieldId, request, userDetails.getUser());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public List<TaskResponse> getTasks(
            @PathVariable UUID farmId,
            @PathVariable UUID fieldId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return taskService.getTasksByField(farmId, fieldId, userDetails.getUser());
    }

    @GetMapping("/{taskId}")
    public TaskResponse getTaskById(
            @PathVariable UUID farmId,
            @PathVariable UUID fieldId,
            @PathVariable UUID taskId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return taskService.getTaskById(farmId, fieldId, taskId, userDetails.getUser());
    }

    @PutMapping("/{taskId}")
    public TaskResponse updateTask(
            @PathVariable UUID farmId,
            @PathVariable UUID fieldId,
            @PathVariable UUID taskId,
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return taskService.updateTask(farmId, fieldId, taskId, request, userDetails.getUser());
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable UUID farmId,
            @PathVariable UUID fieldId,
            @PathVariable UUID taskId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        taskService.deleteTask(farmId, fieldId, taskId, userDetails.getUser());
        return ResponseEntity.noContent().build();
    }
}
