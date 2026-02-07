package com.lms.controller;

import com.lms.dto.request.SubModuleRequest;
import com.lms.dto.response.SubModuleResponse;
import com.lms.service.SubModuleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/submodules")
@RequiredArgsConstructor
public class SubModuleController {
    private final SubModuleService subModuleService;

    @GetMapping("/module/{moduleId}")
    public ResponseEntity<List<SubModuleResponse>> getSubModulesByModule(@PathVariable Long moduleId) {
        return ResponseEntity.ok(subModuleService.getSubModulesByModule(moduleId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubModuleResponse> getSubModule(@PathVariable Long id) {
        return ResponseEntity.ok(subModuleService.getSubModuleById(id));
    }

    @PostMapping("/module/{moduleId}")
    public ResponseEntity<SubModuleResponse> createSubModule(
            @PathVariable Long moduleId,
            @Valid @RequestBody SubModuleRequest request
    ) {
        return ResponseEntity.ok(subModuleService.createSubModule(moduleId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubModuleResponse> updateSubModule(
            @PathVariable Long id,
            @Valid @RequestBody SubModuleRequest request
    ) {
        return ResponseEntity.ok(subModuleService.updateSubModule(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubModule(@PathVariable Long id) {
        subModuleService.deleteSubModule(id);
        return ResponseEntity.noContent().build();
    }
}
