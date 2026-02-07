package com.lms.dto.response;

import com.lms.entity.Course.Difficulty;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class CourseResponse {
    private Long id;
    private String title;
    private String description;
    private String category;
    private Difficulty difficulty;
    private String thumbnailUrl;
    private Boolean published;
    private String createdByName;
    private Long createdById;
    private int moduleCount;
    private int totalSubModules;
    private LocalDateTime createdAt;
    private List<ModuleResponse> modules;
}
