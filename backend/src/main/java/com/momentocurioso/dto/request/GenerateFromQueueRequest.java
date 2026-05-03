package com.momentocurioso.dto.request;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class GenerateFromQueueRequest {

    @NotNull
    private Long topicId;

    private Long aiProviderId;

    @NotNull
    @Size(min = 1)
    private List<Long> articleIds;

    private boolean mock = false;

    public GenerateFromQueueRequest() {}

    public GenerateFromQueueRequest(Long topicId, Long aiProviderId, List<Long> articleIds, boolean mock) {
        this.topicId = topicId;
        this.aiProviderId = aiProviderId;
        this.articleIds = articleIds;
        this.mock = mock;
    }

    public Long topicId()          { return topicId; }
    public Long aiProviderId()     { return aiProviderId; }
    public List<Long> articleIds() { return articleIds; }
    public boolean mock()          { return mock; }

    @AssertTrue(message = "aiProviderId é obrigatório quando mock=false")
    public boolean isAiProviderIdValidForMode() {
        return mock || aiProviderId != null;
    }
}
