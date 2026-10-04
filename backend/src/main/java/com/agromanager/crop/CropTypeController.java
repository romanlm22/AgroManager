package com.agromanager.crop;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/crop-types")
@RequiredArgsConstructor
public class CropTypeController {

    private final CropTypeRepository cropTypeRepository;

    @GetMapping
    public List<CropTypeResponse> getAllCropTypes() {
        return cropTypeRepository.findAll().stream()
                .map(CropTypeResponse::fromEntity)
                .toList();
    }
}