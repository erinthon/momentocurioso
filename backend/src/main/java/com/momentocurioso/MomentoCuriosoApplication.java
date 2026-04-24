package com.momentocurioso;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MomentoCuriosoApplication {

    public static void main(String[] args) {
        SpringApplication.run(MomentoCuriosoApplication.class, args);
    }
}
