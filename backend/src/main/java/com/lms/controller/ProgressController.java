package com.lms.controller;

import com.lms.dto.response.ProgressResponse;
import com.lms.entity.User;
import com.lms.service.AuthService;
import com.lms.service.ProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {
    private final ProgressService progressService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<List<ProgressResponse>> getMyProgress(@AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(progressService.getUserProgress(user.getId()));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<ProgressResponse>> getCourseProgress(
            @PathVariable Long courseId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(progressService.getCourseProgress(user.getId(), courseId));
    }

    @PostMapping("/complete/{subModuleId}")
    public ResponseEntity<ProgressResponse> markComplete(
            @PathVariable Long subModuleId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(progressService.markComplete(user.getId(), subModuleId));
    }

    @PostMapping("/incomplete/{subModuleId}")
    public ResponseEntity<ProgressResponse> markIncomplete(
            @PathVariable Long subModuleId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(progressService.markIncomplete(user.getId(), subModuleId));
    }
}
