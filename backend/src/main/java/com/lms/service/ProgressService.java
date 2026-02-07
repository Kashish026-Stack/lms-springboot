package com.lms.service;

import com.lms.dto.response.ProgressResponse;
import com.lms.entity.Progress;
import com.lms.entity.SubModule;
import com.lms.entity.User;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.ProgressRepository;
import com.lms.repository.SubModuleRepository;
import com.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProgressService {
    private final ProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final SubModuleRepository subModuleRepository;

    public List<ProgressResponse> getUserProgress(Long userId) {
        return progressRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ProgressResponse> getCourseProgress(Long userId, Long courseId) {
        return progressRepository.findByUserIdAndCourseId(userId, courseId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Optional<ProgressResponse> getSubModuleProgress(Long userId, Long subModuleId) {
        return progressRepository.findByUserIdAndSubModuleId(userId, subModuleId)
                .map(this::mapToResponse);
    }

    @Transactional
    public ProgressResponse markComplete(Long userId, Long subModuleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        SubModule subModule = subModuleRepository.findById(subModuleId)
                .orElseThrow(() -> new ResourceNotFoundException("SubModule not found"));

        Progress progress = progressRepository.findByUserIdAndSubModuleId(userId, subModuleId)
                .orElse(Progress.builder()
                        .user(user)
                        .subModule(subModule)
                        .build());

        progress.setCompleted(true);
        progress.setCompletedAt(LocalDateTime.now());

        progress = progressRepository.save(progress);
        return mapToResponse(progress);
    }

    @Transactional
    public ProgressResponse markIncomplete(Long userId, Long subModuleId) {
        Progress progress = progressRepository.findByUserIdAndSubModuleId(userId, subModuleId)
                .orElseThrow(() -> new ResourceNotFoundException("Progress not found"));

        progress.setCompleted(false);
        progress.setCompletedAt(null);

        progress = progressRepository.save(progress);
        return mapToResponse(progress);
    }

    private ProgressResponse mapToResponse(Progress progress) {
        return ProgressResponse.builder()
                .id(progress.getId())
                .userId(progress.getUser().getId())
                .subModuleId(progress.getSubModule().getId())
                .subModuleTitle(progress.getSubModule().getTitle())
                .completed(progress.getCompleted())
                .completedAt(progress.getCompletedAt())
                .build();
    }
}
