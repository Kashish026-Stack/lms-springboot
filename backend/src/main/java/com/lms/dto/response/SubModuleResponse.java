package com.lms.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class SubModuleResponse {
    private Long id;
    private String title;
    private Integer orderIndex;
    private Long moduleId;
    private String introContent;
    private String bodyContent;
    private String summaryContent;
    private String videoUrl;
    private List<McqQuestionResponse> mcqQuestions;
    private List<CodingQuestionResponse> codingQuestions;

    @Data
    @Builder
    public static class McqQuestionResponse {
        private Long id;
        private String question;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private Integer orderIndex;
    }

    @Data
    @Builder
    public static class CodingQuestionResponse {
        private Long id;
        private String question;
        private String starterCode;
        private String hint;
        private Integer orderIndex;
    }
}
