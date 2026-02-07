package com.lms.controller;

import com.lms.dto.response.EnrollmentResponse;
import com.lms.entity.User;
import com.lms.service.AuthService;
import com.lms.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {
    private final EnrollmentService enrollmentService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<List<EnrollmentResponse>> getMyEnrollments(@AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(enrollmentService.getUserEnrollments(user.getId()));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<EnrollmentResponse> getEnrollment(
            @PathVariable Long courseId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(enrollmentService.getEnrollment(user.getId(), courseId));
    }

    @GetMapping("/check/{courseId}")
    public ResponseEntity<Map<String, Boolean>> checkEnrollment(
            @PathVariable Long courseId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        boolean enrolled = enrollmentService.isEnrolled(user.getId(), courseId);
        return ResponseEntity.ok(Map.of("enrolled", enrolled));
    }

    @PostMapping("/course/{courseId}")
    public ResponseEntity<EnrollmentResponse> enroll(
            @PathVariable Long courseId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(enrollmentService.enroll(user.getId(), courseId));
    }

    @DeleteMapping("/course/{courseId}")
    public ResponseEntity<Void> unenroll(
            @PathVariable Long courseId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        enrollmentService.unenroll(user.getId(), courseId);
        return ResponseEntity.noContent().build();
    }
}
