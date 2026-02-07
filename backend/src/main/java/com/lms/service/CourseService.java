package com.lms.service;

import com.lms.dto.request.CourseRequest;
import com.lms.dto.response.CourseResponse;
import com.lms.dto.response.ModuleResponse;
import com.lms.dto.response.SubModuleResponse;
import com.lms.entity.Course;
import com.lms.entity.User;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.CourseRepository;
import com.lms.repository.SubModuleRepository;
import com.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final SubModuleRepository subModuleRepository;

    public List<CourseResponse> getAllPublishedCourses() {
        return courseRepository.findByPublishedTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<CourseResponse> getCoursesByUser(Long userId) {
        return courseRepository.findByCreatedById(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CourseResponse getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        return mapToDetailedResponse(course);
    }

    public List<String> getAllCategories() {
        return courseRepository.findAllCategories();
    }

    @Transactional
    public CourseResponse createCourse(CourseRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .difficulty(request.getDifficulty())
                .thumbnailUrl(request.getThumbnailUrl())
                .published(request.getPublished() != null ? request.getPublished() : false)
                .createdBy(user)
                .build();

        course = courseRepository.save(course);
        return mapToResponse(course);
    }

    @Transactional
    public CourseResponse updateCourse(Long id, CourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setCategory(request.getCategory());
        course.setDifficulty(request.getDifficulty());
        course.setThumbnailUrl(request.getThumbnailUrl());
        if (request.getPublished() != null) {
            course.setPublished(request.getPublished());
        }

        course = courseRepository.save(course);
        return mapToResponse(course);
    }

    @Transactional
    public CourseResponse setPublished(Long id, boolean published) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        course.setPublished(published);
        course = courseRepository.save(course);
        return mapToResponse(course);
    }

    @Transactional
    public void deleteCourse(Long id) {
        if (!courseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Course not found");
        }
        courseRepository.deleteById(id);
    }

    private CourseResponse mapToResponse(Course course) {
        int totalSubModules = subModuleRepository.countByCourseId(course.getId());
        
        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .category(course.getCategory())
                .difficulty(course.getDifficulty())
                .thumbnailUrl(course.getThumbnailUrl())
                .published(course.getPublished())
                .createdByName(course.getCreatedBy() != null ? course.getCreatedBy().getName() : null)
                .createdById(course.getCreatedBy() != null ? course.getCreatedBy().getId() : null)
                .moduleCount(course.getModules() != null ? course.getModules().size() : 0)
                .totalSubModules(totalSubModules)
                .createdAt(course.getCreatedAt())
                .build();
    }

    private CourseResponse mapToDetailedResponse(Course course) {
        int totalSubModules = subModuleRepository.countByCourseId(course.getId());
        java.util.List<com.lms.entity.Module> courseModules = course.getModules() != null ? course.getModules() : java.util.Collections.emptyList();
        
        List<ModuleResponse> modules = courseModules.stream()
                .map(module -> {
                    java.util.List<com.lms.entity.SubModule> subs = module.getSubModules() != null ? module.getSubModules() : java.util.Collections.emptyList();
                    return ModuleResponse.builder()
                        .id(module.getId())
                        .title(module.getTitle())
                        .orderIndex(module.getOrderIndex())
                        .courseId(course.getId())
                        .subModuleCount(subs.size())
                        .subModules(subs.stream()
                                .map(sm -> SubModuleResponse.builder()
                                        .id(sm.getId())
                                        .title(sm.getTitle())
                                        .orderIndex(sm.getOrderIndex())
                                        .moduleId(module.getId())
                                        .build())
                                .collect(Collectors.toList()))
                        .build();
                })
                .collect(Collectors.toList());

        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .category(course.getCategory())
                .difficulty(course.getDifficulty())
                .thumbnailUrl(course.getThumbnailUrl())
                .published(course.getPublished())
                .createdByName(course.getCreatedBy() != null ? course.getCreatedBy().getName() : null)
                .createdById(course.getCreatedBy() != null ? course.getCreatedBy().getId() : null)
                .moduleCount(courseModules.size())
                .totalSubModules(totalSubModules)
                .createdAt(course.getCreatedAt())
                .modules(modules)
                .build();
    }
}
