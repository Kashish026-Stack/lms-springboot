package com.lms.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class EnrollmentResponse {
    private Long id;
    private Long userId;
    private Long courseId;
    private String courseTitle;
    private String status;
    private int progressPercentage;
    private int completedSubModules;
    private int totalSubModules;
    private LocalDateTime enrolledAt;
}
