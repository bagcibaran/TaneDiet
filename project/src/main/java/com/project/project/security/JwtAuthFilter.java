package com.project.project.security;

import com.project.project.entity.User;
import com.project.project.exception.ClientAccessLockedException;
import com.project.project.repository.UserRepository;
import com.project.project.service.impl.ClientAccessService;
import com.project.project.service.impl.ConsentService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final ClientAccessService clientAccessService;
    private final ConsentService consentService;

    public JwtAuthFilter(
            JwtService jwtService,
            UserRepository userRepository,
            ClientAccessService clientAccessService,
            ConsentService consentService
    ) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.clientAccessService = clientAccessService;
        this.consentService = consentService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            Claims claims = jwtService.parseClaims(token);
            String username = claims.getSubject();
            String role = claims.get("role", String.class);

            // Token durumsuz: hizmet süresi dolan danışanın token'ı hâlâ geçerli olabilir.
            // Bu yüzden danışan her istekte veritabanından kontrol edilir; kilitliyse 423 döner.
            // /auth/** (giriş, kayıt, davet kontrolü) ve /legal/** (KVKK metinleri) hariç: eski bir token kalsa bile bu sayfalar çalışmalı.
            if ("CLIENT".equals(role) && !isOpenPath(request)) {
                Optional<User> user = userRepository.findByUsername(username);
                // Kullanıcı bulunamadı (adı değişti veya silindi): oturum tanınmaz, korumalı istek 401 alır
                if (user.isEmpty()) {
                    filterChain.doFilter(request, response);
                    return;
                }
                if (clientAccessService.isLocked(user.get())) {
                    writeError(response, 423, ClientAccessLockedException.MESSAGE);
                    return;
                }
                // KVKK: güncel açık rıza metnini onaylamamış danışan, onay ekranı dışında hiçbir veriye ulaşamaz (428)
                if (!isConsentPath(request) && consentService.needsConsent(user.get())) {
                    writeError(response, 428, CONSENT_REQUIRED_MESSAGE);
                    return;
                }
            }

            if (role != null) {
                List<SimpleGrantedAuthority> authorities =
                        List.of(new SimpleGrantedAuthority("ROLE_" + role));

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(username, null, authorities);

                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } catch (JwtException | IllegalArgumentException e) {
            // Geçersiz veya süresi dolmuş token: kullanıcıyı tanımadan devam ediyoruz.
            // Korumalı bir endpoint'e gidiyorsa Spring Security 401 döner.
        }

        filterChain.doFilter(request, response);
    }

    private static final String CONSENT_REQUIRED_MESSAGE = "Devam etmek için güncel açık rıza metnini onaylaman gerekiyor.";

    // Giriş/kayıt ve KVKK metinleri: kilit ve rıza kontrolü yapılmaz
    private boolean isOpenPath(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/auth/") || path.startsWith("/legal/");
    }

    private boolean isConsentPath(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.equals("/consent") || path.startsWith("/consent/");
    }

    // Mesajlar sabit ve tırnak içermez, bu yüzden JSON elle yazılabilir
    private void writeError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write("{\"status\":" + status + ",\"message\":\"" + message + "\"}");
    }
}