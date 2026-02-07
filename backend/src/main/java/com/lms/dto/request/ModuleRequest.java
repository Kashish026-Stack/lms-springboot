package com.lms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ModuleRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Order index is required")
    private Integer orderIndex;
}
