package com.lms.service;

import com.lms.dto.request.SubModuleRequest;
import com.lms.dto.response.SubModuleResponse;
import com.lms.entity.CodingQuestion;
import com.lms.entity.McqQuestion;
import com.lms.entity.Module;
import com.lms.entity.SubModule;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.ModuleRepository;
import com.lms.repository.SubModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubModuleService {
    private final SubModuleRepository subModuleRepository;
    private final ModuleRepository moduleRepository;

    public List<SubModuleResponse> getSubModulesByModule(Long moduleId) {
        return subModuleRepository.findByModuleIdOrderByOrderIndexAsc(moduleId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public SubModuleResponse getSubModuleById(Long id) {
        SubModule subModule = subModuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SubModule not found"));
        return mapToDetailedResponse(subModule);
    }

    @Transactional
    public SubModuleResponse createSubModule(Long moduleId, SubModuleRequest request) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));

        SubModule subModule = SubModule.builder()
                .title(request.getTitle())
                .orderIndex(request.getOrderIndex())
                .module(module)
                .introContent(request.getIntroContent())
                .bodyContent(request.getBodyContent())
                .summaryContent(request.getSummaryContent())
                .videoUrl(request.getVideoUrl())
                .build();

        if (request.getMcqQuestions() != null) {
            for (SubModuleRequest.McqQuestionRequest mcqReq : request.getMcqQuestions()) {
                McqQuestion mcq = McqQuestion.builder()
                        .question(mcqReq.getQuestion())
                        .optionA(mcqReq.getOptionA())
                        .optionB(mcqReq.getOptionB())
                        .optionC(mcqReq.getOptionC())
                        .optionD(mcqReq.getOptionD())
                        .correctOption(mcqReq.getCorrectOption())
                        .orderIndex(mcqReq.getOrderIndex())
                        .subModule(subModule)
                        .build();
                subModule.getMcqQuestions().add(mcq);
            }
        }

        if (request.getCodingQuestions() != null) {
            for (SubModuleRequest.CodingQuestionRequest codeReq : request.getCodingQuestions()) {
                CodingQuestion code = CodingQuestion.builder()
                        .question(codeReq.getQuestion())
                        .starterCode(codeReq.getStarterCode())
                        .solution(codeReq.getSolution())
                        .hint(codeReq.getHint())
                        .orderIndex(codeReq.getOrderIndex())
                        .subModule(subModule)
                        .build();
                subModule.getCodingQuestions().add(code);
            }
        }

        subModule = subModuleRepository.save(subModule);
        return mapToResponse(subModule);
    }

    @Transactional
    public SubModuleResponse updateSubModule(Long id, SubModuleRequest request) {
        SubModule subModule = subModuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SubModule not found"));

        subModule.setTitle(request.getTitle());
        subModule.setOrderIndex(request.getOrderIndex());
        subModule.setIntroContent(request.getIntroContent());
        subModule.setBodyContent(request.getBodyContent());
        subModule.setSummaryContent(request.getSummaryContent());
        subModule.setVideoUrl(request.getVideoUrl());

        subModule = subModuleRepository.save(subModule);
        return mapToResponse(subModule);
    }

    @Transactional
    public void deleteSubModule(Long id) {
        if (!subModuleRepository.existsById(id)) {
            throw new ResourceNotFoundException("SubModule not found");
        }
        subModuleRepository.deleteById(id);
    }

    private SubModuleResponse mapToResponse(SubModule subModule) {
        return SubModuleResponse.builder()
                .id(subModule.getId())
                .title(subModule.getTitle())
                .orderIndex(subModule.getOrderIndex())
                .moduleId(subModule.getModule().getId())
                .introContent(subModule.getIntroContent())
                .bodyContent(subModule.getBodyContent())
                .summaryContent(subModule.getSummaryContent())
                .videoUrl(subModule.getVideoUrl())
                .build();
    }

    private SubModuleResponse mapToDetailedResponse(SubModule subModule) {
        List<SubModuleResponse.McqQuestionResponse> mcqs = subModule.getMcqQuestions().stream()
                .map(mcq -> SubModuleResponse.McqQuestionResponse.builder()
                        .id(mcq.getId())
                        .question(mcq.getQuestion())
                        .optionA(mcq.getOptionA())
                        .optionB(mcq.getOptionB())
                        .optionC(mcq.getOptionC())
                        .optionD(mcq.getOptionD())
                        .orderIndex(mcq.getOrderIndex())
                        .build())
                .collect(Collectors.toList());

        List<SubModuleResponse.CodingQuestionResponse> codes = subModule.getCodingQuestions().stream()
                .map(code -> SubModuleResponse.CodingQuestionResponse.builder()
                        .id(code.getId())
                        .question(code.getQuestion())
                        .starterCode(code.getStarterCode())
                        .hint(code.getHint())
                        .orderIndex(code.getOrderIndex())
                        .build())
                .collect(Collectors.toList());

        return SubModuleResponse.builder()
                .id(subModule.getId())
                .title(subModule.getTitle())
                .orderIndex(subModule.getOrderIndex())
                .moduleId(subModule.getModule().getId())
                .introContent(subModule.getIntroContent())
                .bodyContent(subModule.getBodyContent())
                .summaryContent(subModule.getSummaryContent())
                .videoUrl(subModule.getVideoUrl())
                .mcqQuestions(mcqs)
                .codingQuestions(codes)
                .build();
    }
}
