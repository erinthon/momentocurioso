package com.momentocurioso.service;

import com.momentocurioso.dto.response.JobStatusResponse;
import com.momentocurioso.entity.ContentGenerationJob;
import com.momentocurioso.entity.Post;
import com.momentocurioso.entity.Topic;
import com.momentocurioso.entity.TriggerSource;

import java.util.List;

public interface ContentGenerationJobService {

    ContentGenerationJob createJob(Topic topic, TriggerSource triggeredBy);

    ContentGenerationJob markRunning(ContentGenerationJob job);

    ContentGenerationJob markDone(ContentGenerationJob job, Post post);

    ContentGenerationJob markFailed(ContentGenerationJob job, String errorMessage);

    List<JobStatusResponse> listAll();
}
