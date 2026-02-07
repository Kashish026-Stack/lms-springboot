package com.lms.service;

import com.lms.dto.request.ModuleRequest;
import com.lms.dto.response.ModuleResponse;
import com.lms.dto.response.SubModuleResponse;
import com.lms.entity.Course;
import com.lms.entity.Module;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.CourseRepository;
import com.lms.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ModuleService {
    private final ModuleRepository moduleRepository;
    private final CourseRepository courseRepository;

    @Transactional(readOnly = true)
    public List<ModuleResponse> getModulesByCourse(Long courseId) {
        return moduleRepository.findByCourseIdOrderByOrderIndexAsc(courseId).stream()
                .map(this::mapToDetailedResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ModuleResponse getModuleById(Long id) {
        Module module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));
        return mapToDetailedResponse(module);
    }

    @Transactional
    public ModuleResponse createModule(Long courseId, ModuleRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        Module module = Module.builder()
                .title(request.getTitle())
                .orderIndex(request.getOrderIndex())
                .course(course)
                .build();

        module = moduleRepository.save(module);
        return mapToResponse(module);
    }

    @Transactional
    public ModuleResponse updateModule(Long id, ModuleRequest request) {
        Module module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));

        module.setTitle(request.getTitle());
        module.setOrderIndex(request.getOrderIndex());

        module = moduleRepository.save(module);
        return mapToResponse(module);
    }

    @Transactional
    public void deleteModule(Long id) {
        if (!moduleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Module not found");
        }
        moduleRepository.deleteById(id);
    }

    private ModuleResponse mapToResponse(Module module) {
        int subModuleCount = module.getSubModules() != null ? module.getSubModules().size() : 0;
        return ModuleResponse.builder()
                .id(module.getId())
                .title(module.getTitle())
                .orderIndex(module.getOrderIndex())
                .courseId(module.getCourse().getId())
                .subModuleCount(subModuleCount)
                .build();
    }

    private ModuleResponse mapToDetailedResponse(Module module) {
        java.util.List<com.lms.entity.SubModule> moduleSubModules = module.getSubModules() != null ? module.getSubModules() : java.util.Collections.emptyList();
        
        List<SubModuleResponse> subModules = moduleSubModules.stream()
                .map(sm -> SubModuleResponse.builder()
                        .id(sm.getId())
                        .title(sm.getTitle())
                        .orderIndex(sm.getOrderIndex())
                        .moduleId(module.getId())
                        .introContent(sm.getIntroContent())
                        .bodyContent(sm.getBodyContent())
                        .summaryContent(sm.getSummaryContent())
                        .videoUrl(sm.getVideoUrl())
                        .build())
                .collect(Collectors.toList());

        return ModuleResponse.builder()
                .id(module.getId())
                .title(module.getTitle())
                .orderIndex(module.getOrderIndex())
                .courseId(module.getCourse().getId())
                .subModuleCount(moduleSubModules.size())
                .subModules(subModules)
                .build();
    }
}
