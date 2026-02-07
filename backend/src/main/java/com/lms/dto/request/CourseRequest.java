package com.lms.dto.request;

import com.lms.entity.Course.Difficulty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CourseRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private String category;
    private Difficulty difficulty;
    private String thumbnailUrl;
    private Boolean published;
}
