package com.project.project;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertTrue;

// Bekçi: kullanıcıya giden her Türkçe sunucu mesajının ön yüzde İngilizce ve Almanca çevirisi olmalı
// (client/src/i18n/serverErrors.json). Yeni mesaj ekleyip çevirisini unutursan bu test hangi mesaj olduğunu söyler.
// client/ klasörü yoksa (arka uç tek başına derlenirse) test atlanır.
class ServerMessagesTranslatedTest {

    private static final Path SOURCES = Path.of("src/main/java");
    private static final Path TRANSLATIONS = Path.of("../client/src/i18n/serverErrors.json");

    // new XxxException("...") ve iç içe sınıflar: new XxxException.NotFound("...") (metin bir sonraki satırda da başlayabilir)
    private static final Pattern EXCEPTION = Pattern.compile("new (\\w+Exception)(?:\\.\\w+)?\\(\\s*\"((?:[^\"\\\\]|\\\\.)*)\"");
    // doğrulama notları ve GlobalExceptionHandler: message = "..."
    private static final Pattern MESSAGE_ASSIGN = Pattern.compile("\\bmessage\\s*=\\s*\"((?:[^\"\\\\]|\\\\.)*)\"");
    // sabitler: MESSAGE = "..." / ..._MESSAGE = "..."
    private static final Pattern MESSAGE_CONSTANT = Pattern.compile("\\b\\w*MESSAGE\\s*=\\s*\"((?:[^\"\\\\]|\\\\.)*)\"");

    // Kullanıcıya hiç gitmeyenler: 403'te ön yüz kendi metnini gösterir; IllegalStateException iç hatadır (500 olur);
    // görev (to-do) ekranı kaldırıldı
    private static final List<String> IGNORED_EXCEPTIONS = List.of("AccessDeniedException", "TaskNotFoundException", "IllegalStateException");
    private static final List<String> IGNORED_FILES =
            List.of("TaskService.java", "TaskServiceTwo.java", "TaskCreateRequest.java", "TaskUpdateRequest.java");

    @Test
    void everyServerMessageHasEnglishAndGerman() throws IOException {
        Assumptions.assumeTrue(Files.exists(TRANSLATIONS), "client/ klasörü yok: çeviri kontrolü atlandı");
        JsonNode translations = new ObjectMapper().readTree(Files.readString(TRANSLATIONS, StandardCharsets.UTF_8));

        List<String> missing = new ArrayList<>();
        for (String message : serverMessages()) {
            JsonNode entry = translations.get(message);
            if (entry == null || entry.path("en").asText("").isBlank() || entry.path("de").asText("").isBlank()) {
                missing.add(message);
            }
        }

        assertTrue(missing.isEmpty(), "serverErrors.json içinde en/de çevirisi eksik:\n" + String.join("\n", missing));
    }

    // Kaynak koddaki kullanıcıya giden mesajlar (sıralı, tekrarsız)
    static TreeSet<String> serverMessages() throws IOException {
        TreeSet<String> messages = new TreeSet<>();
        try (Stream<Path> files = Files.walk(SOURCES)) {
            for (Path file : files.filter(p -> p.toString().endsWith(".java")).toList()) {
                if (IGNORED_FILES.contains(file.getFileName().toString())) {
                    continue;
                }
                String source = Files.readString(file, StandardCharsets.UTF_8);
                Matcher exception = EXCEPTION.matcher(source);
                while (exception.find()) {
                    if (!IGNORED_EXCEPTIONS.contains(exception.group(1))) {
                        messages.add(unescape(exception.group(2)));
                    }
                }
                for (Pattern pattern : List.of(MESSAGE_ASSIGN, MESSAGE_CONSTANT)) {
                    Matcher match = pattern.matcher(source);
                    while (match.find()) {
                        messages.add(unescape(match.group(1)));
                    }
                }
            }
        }
        messages.removeIf(String::isBlank);
        return messages;
    }

    private static String unescape(String literal) {
        return literal.replace("\\\"", "\"").replace("\\\\", "\\");
    }
}
