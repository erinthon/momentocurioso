package com.momentocurioso.service;

import com.momentocurioso.dto.AiGeneratedContent;
import com.momentocurioso.entity.Topic;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("dev")
class AiWriterServiceTest {

    @Autowired
    AiWriterService aiWriterService;

    @Test
    void generate_returnsContentWithTitleAndSummary() {
        Topic topic = new Topic();
        topic.setName("IA");
        topic.setSlug("ia");

        AiGeneratedContent result = aiWriterService.generate(topic, List.of());

        assertThat(result.title()).isNotBlank();
        assertThat(result.summary()).isNotBlank();
        assertThat(result.content()).isNotBlank();
    }
}
