package com.agromanager.task;

import com.agromanager.crop.Crop;
import com.agromanager.crop.CropRepository;
import com.agromanager.farm.FarmAccessDeniedException;
import com.agromanager.farm.FarmUserRepository;
import com.agromanager.field.Field;
import com.agromanager.field.FieldRepository;
import com.agromanager.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AgriculturalTaskService {

    private final AgriculturalTaskRepository taskRepository;
    private final FieldRepository fieldRepository;
    private final CropRepository cropRepository;
    private final FarmUserRepository farmUserRepository;

    @Transactional
    public TaskResponse createTask(UUID farmId, UUID fieldId, TaskRequest request, User currentUser) {
        Field field = getAuthorizedField(farmId, fieldId, currentUser);
        Crop crop = resolveCrop(request.cropId(), fieldId);

        AgriculturalTask task = AgriculturalTask.builder()
                .field(field)
                .crop(crop)
                .responsible(currentUser)
                .taskType(request.taskType())
                .status(request.status())
                .taskDate(request.taskDate())
                .cost(request.cost())
                .notes(request.notes())
                .build();

        taskRepository.save(task);

        return TaskResponse.fromEntity(task);
    }

    public List<TaskResponse> getTasksByField(UUID farmId, UUID fieldId, User currentUser) {
        getAuthorizedField(farmId, fieldId, currentUser);

        return taskRepository.findAllByFieldId(fieldId).stream()
                .map(TaskResponse::fromEntity)
                .toList();
    }

    public TaskResponse getTaskById(UUID farmId, UUID fieldId, UUID taskId, User currentUser) {
        getAuthorizedField(farmId, fieldId, currentUser);

        AgriculturalTask task = taskRepository.findByIdAndFieldId(taskId, fieldId)
                .orElseThrow(() -> new NoSuchElementException("Task not found"));

        return TaskResponse.fromEntity(task);
    }

    @Transactional
    public TaskResponse updateTask(UUID farmId, UUID fieldId, UUID taskId, TaskRequest request, User currentUser) {
        getAuthorizedField(farmId, fieldId, currentUser);

        AgriculturalTask task = taskRepository.findByIdAndFieldId(taskId, fieldId)
                .orElseThrow(() -> new NoSuchElementException("Task not found"));

        Crop crop = resolveCrop(request.cropId(), fieldId);

        task.setCrop(crop);
        task.setTaskType(request.taskType());
        if (request.status() != null) {
            task.setStatus(request.status());
        }
        task.setTaskDate(request.taskDate());
        task.setCost(request.cost());
        task.setNotes(request.notes());

        taskRepository.save(task);

        return TaskResponse.fromEntity(task);
    }

    @Transactional
    public void deleteTask(UUID farmId, UUID fieldId, UUID taskId, User currentUser) {
        getAuthorizedField(farmId, fieldId, currentUser);

        AgriculturalTask task = taskRepository.findByIdAndFieldId(taskId, fieldId)
                .orElseThrow(() -> new NoSuchElementException("Task not found"));

        taskRepository.delete(task);
    }

    private Field getAuthorizedField(UUID farmId, UUID fieldId, User currentUser) {
        boolean hasAccess = farmUserRepository.existsByFarmIdAndUserId(farmId, currentUser.getId());

        if (!hasAccess) {
            throw new FarmAccessDeniedException("You do not have access to this farm");
        }

        return fieldRepository.findByIdAndFarmId(fieldId, farmId)
                .orElseThrow(() -> new NoSuchElementException("Field not found"));
    }

    private Crop resolveCrop(UUID cropId, UUID fieldId) {
        if (cropId == null) {
            return null;
        }

        return cropRepository.findByIdAndFieldId(cropId, fieldId)
                .orElseThrow(() -> new NoSuchElementException("Crop not found in this field"));
    }
}
