package com.lms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class SubModuleRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Order index is required")
    private Integer orderIndex;

    private String introContent;
    private String bodyContent;
    private String summaryContent;
    private String videoUrl;
    private List<McqQuestionRequest> mcqQuestions;
    private List<CodingQuestionRequest> codingQuestions;

    @Data
    public static class McqQuestionRequest {
        private String question;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private String correctOption;
        private Integer orderIndex;
    }

    @Data
    public static class CodingQuestionRequest {
        private String question;
        private String starterCode;
        private String solution;
        private String hint;
        private Integer orderIndex;
    }
}
