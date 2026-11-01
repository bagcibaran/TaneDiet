package com.project.project.config;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.context.request.async.AsyncRequestNotUsableException;
import org.springframework.web.servlet.HandlerMapping;
import org.springframework.web.servlet.ModelAndView;

import static org.junit.jupiter.api.Assertions.*;

class UnexpectedErrorResolverTest {

    private final UnexpectedErrorResolver resolver = new UnexpectedErrorResolver();
    private Logger logger;
    private ListAppender<ILoggingEvent> appender;

    @BeforeEach
    void captureLog() {
        logger = (Logger) LoggerFactory.getLogger(UnexpectedErrorResolver.class);
        appender = new ListAppender<>();
        appender.start();
        logger.addAppender(appender);
    }

    @AfterEach
    void releaseLog() {
        logger.detachAppender(appender);
    }

    private MockHttpServletRequest request(String uri, String pattern) {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", uri);
        if (pattern != null) {
            request.setAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE, pattern);
        }
        return request;
    }

    // Beklenmeyen hata: 500 ve genel mesaj; iç ayrıntı (hata mesajı) kullanıcıya gitmez
    @Test
    void unexpectedErrorIs500WithGenericMessage() throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();

        ModelAndView view = resolver.resolveException(
                request("/clients", "/clients"), response, null, new IllegalStateException("gizli ayrinti"));

        assertNotNull(view);
        assertEquals(500, response.getStatus());
        assertTrue(response.getContentAsString().contains("Beklenmeyen bir hata oluştu"));
        assertFalse(response.getContentAsString().contains("gizli ayrinti"));
    }

    // Logda gerçek yol değil kalıp: davet token'ı loga düşmez
    @Test
    void logsPatternNotRealPath() {
        resolver.resolveException(request("/auth/invites/SECRET", "/auth/invites/{token}"), new MockHttpServletResponse(), null,
                new IllegalStateException("x"));

        String logged = appender.list.get(0).getFormattedMessage();
        assertTrue(logged.contains("/auth/invites/{token}"), logged);
        assertFalse(logged.contains("SECRET"), logged);
    }

    @Test
    void unmatchedPathIsNotLogged() {
        resolver.resolveException(request("/xyz/SECRET", null), new MockHttpServletResponse(), null, new IllegalStateException("x"));

        assertFalse(appender.list.get(0).getFormattedMessage().contains("SECRET"));
    }

    // İstemci bağlantıyı kopardı: loglanmaz, yanıt yazılmaz
    @Test
    void clientAbortIsIgnored() {
        MockHttpServletResponse response = new MockHttpServletResponse();

        ModelAndView view = resolver.resolveException(request("/weights", "/weights"), response, null,
                new AsyncRequestNotUsableException("closed"));

        assertNull(view);
        assertTrue(appender.list.isEmpty());
    }
}
