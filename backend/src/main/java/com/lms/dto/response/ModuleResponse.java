package com.lms.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ModuleResponse {
    private Long id;
    private String title;
    private Integer orderIndex;
    private Long courseId;
    private int subModuleCount;
    private List<SubModuleResponse> subModules;
}
