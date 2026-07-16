package com.momentocurioso.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SubscribeNewsletterRequest(
        @NotBlank @Email @Size(max = 320) String email,
        @Size(max = 100) String name,
        @AssertTrue(message = "É necessário aceitar receber a newsletter") boolean consent,
        @Size(max = 200) String website
) {
}
