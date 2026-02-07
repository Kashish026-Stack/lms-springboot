package com.lms.service;

import com.lms.dto.response.EnrollmentResponse;
import com.lms.entity.Course;
import com.lms.entity.Enrollment;
import com.lms.entity.User;
import com.lms.exception.BadRequestException;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.CourseRepository;
import com.lms.repository.EnrollmentRepository;
import com.lms.repository.ProgressRepository;
import com.lms.repository.SubModuleRepository;
import com.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnrollmentService {
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final ProgressRepository progressRepository;
    private final SubModuleRepository subModuleRepository;

    public List<EnrollmentResponse> getUserEnrollments(Long userId) {
        return enrollmentRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public EnrollmentResponse getEnrollment(Long userId, Long courseId) {
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));
        return mapToResponse(enrollment);
    }

    public boolean isEnrolled(Long userId, Long courseId) {
        return enrollmentRepository.existsByUserIdAndCourseId(userId, courseId);
    }

    @Transactional
    public EnrollmentResponse enroll(Long userId, Long courseId) {
        if (enrollmentRepository.existsByUserIdAndCourseId(userId, courseId)) {
            throw new BadRequestException("Already enrolled in this course");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        if (!course.getPublished()) {
            throw new BadRequestException("Course is not available for enrollment");
        }

        Enrollment enrollment = Enrollment.builder()
                .user(user)
                .course(course)
                .status(Enrollment.Status.ACTIVE)
                .build();

        enrollment = enrollmentRepository.save(enrollment);
        return mapToResponse(enrollment);
    }

    @Transactional
    public void unenroll(Long userId, Long courseId) {
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));
        enrollmentRepository.delete(enrollment);
    }

    private EnrollmentResponse mapToResponse(Enrollment enrollment) {
        int totalSubModules = subModuleRepository.countByCourseId(enrollment.getCourse().getId());
        int completedSubModules = progressRepository.countCompletedByUserIdAndCourseId(
                enrollment.getUser().getId(), enrollment.getCourse().getId());
        
        int progressPercentage = totalSubModules > 0 
                ? (int) Math.round((double) completedSubModules / totalSubModules * 100) 
                : 0;

        return EnrollmentResponse.builder()
                .id(enrollment.getId())
                .userId(enrollment.getUser().getId())
                .courseId(enrollment.getCourse().getId())
                .courseTitle(enrollment.getCourse().getTitle())
                .status(enrollment.getStatus().name())
                .progressPercentage(progressPercentage)
                .completedSubModules(completedSubModules)
                .totalSubModules(totalSubModules)
                .enrolledAt(enrollment.getEnrolledAt())
                .build();
    }
}
