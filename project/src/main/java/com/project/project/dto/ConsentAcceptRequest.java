package com.project.project.dto;

import jakarta.validation.constraints.NotBlank;

// Danışan güncel açık rıza metnini onaylıyor: yalnızca gördüğü sürüm gönderilir (metnin özeti sunucuda hesaplanır)
public class ConsentAcceptRequest {

    @NotBlank(message = "Metin sürümü gerekli")
    private String version;

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }
}
