package com.project.project.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.context.request.async.AsyncRequestNotUsableException;
import org.springframework.web.servlet.HandlerExceptionResolver;
import org.springframework.web.servlet.HandlerMapping;
import org.springframework.web.servlet.ModelAndView;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

// Son yakalayıcı: Spring'in kendi çözücülerinden (bizim @ExceptionHandler'lar, 400/404/405 gibi) SONRA çalışır,
// yalnızca hiçbirinin işlemediği beklenmeyen hataları alır (WebConfig listenin sonuna ekler).
// Kullanıcıya iç ayrıntı vermez; sunucu loguna yöntem, eşleşen yol kalıbı ve hata yığını yazar.
// Kişisel veri yazılmaz: istek gövdesi, kullanıcı adı ve gerçek yol yok (ör. davet token'ı yoldadır).
public class UnexpectedErrorResolver implements HandlerExceptionResolver {

    private static final Logger log = LoggerFactory.getLogger(UnexpectedErrorResolver.class);

    static final String MESSAGE = "Beklenmeyen bir hata oluştu";

    @Override
    public ModelAndView resolveException(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        // İstemci bağlantıyı kopardı (sayfa kapandı vb.): yazılacak yanıt yok, hata da değil
        if (ex instanceof AsyncRequestNotUsableException || "ClientAbortException".equals(ex.getClass().getSimpleName())) {
            return null;
        }

        Object pattern = request.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE);
        log.error("Beklenmeyen hata: {} {}", request.getMethod(), pattern != null ? pattern : "(eşleşmeyen yol)", ex);

        try {
            if (!response.isCommitted()) {
                response.setStatus(500);
                response.setContentType("application/json");
                response.setCharacterEncoding(StandardCharsets.UTF_8.name());
                response.getWriter().write("{\"status\":500,\"message\":\"" + MESSAGE + "\"}");
            }
        } catch (IOException writeError) {
            // Yanıt yazılamadı (bağlantı koptu): yapılacak bir şey yok
        }
        return new ModelAndView();
    }
}
