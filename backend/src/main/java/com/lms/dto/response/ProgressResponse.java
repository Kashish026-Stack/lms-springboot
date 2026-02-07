package com.lms.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ProgressResponse {
    private Long id;
    private Long userId;
    private Long subModuleId;
    private String subModuleTitle;
    private Boolean completed;
    private LocalDateTime completedAt;
}
