package com.momentocurioso.scheduler;

import org.junit.jupiter.api.Test;
import org.springframework.scheduling.annotation.Scheduled;

import java.lang.reflect.Method;

import static org.assertj.core.api.Assertions.assertThat;

class ContentGenerationSchedulerTest {

    // ── BUG-018: Scheduler usa fixedDelay (não fixedRate) para evitar execuções simultâneas ──

    @Test
    void schedulerRunMethod_hasFixedDelayStringAnnotation() throws Exception {
        Method runMethod = ContentGenerationScheduler.class.getMethod("run");
        Scheduled scheduled = runMethod.getAnnotation(Scheduled.class);

        assertThat(scheduled).isNotNull();
        assertThat(scheduled.fixedDelayString())
                .as("fixedDelayString deve estar configurado para evitar execuções concorrentes")
                .isNotEmpty();
    }

    @Test
    void schedulerRunMethod_doesNotHaveFixedRateStringAnnotation() throws Exception {
        Method runMethod = ContentGenerationScheduler.class.getMethod("run");
        Scheduled scheduled = runMethod.getAnnotation(Scheduled.class);

        assertThat(scheduled).isNotNull();
        assertThat(scheduled.fixedRateString())
                .as("fixedRateString não deve estar configurado (causaria execuções sobrepostas)")
                .isEmpty();

        assertThat(scheduled.fixedRate())
                .as("fixedRate (long) não deve estar configurado")
                .isEqualTo(-1L);
    }

    @Test
    void schedulerRunMethod_hasInitialDelayStringAnnotation() throws Exception {
        Method runMethod = ContentGenerationScheduler.class.getMethod("run");
        Scheduled scheduled = runMethod.getAnnotation(Scheduled.class);

        assertThat(scheduled).isNotNull();
        assertThat(scheduled.initialDelayString())
                .as("initialDelayString deve estar configurado para evitar execução imediata no startup")
                .isNotEmpty();
    }
}
