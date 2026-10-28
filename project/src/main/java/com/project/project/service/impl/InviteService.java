package com.project.project.service.impl;

import com.project.project.dto.InviteCreateRequest;
import com.project.project.dto.InviteLookupResponse;
import com.project.project.dto.InviteResponse;
import com.project.project.entity.Invite;
import com.project.project.entity.User;
import com.project.project.exception.InviteInvalidException;
import com.project.project.exception.UserNotFoundException;
import com.project.project.repository.InviteRepository;
import com.project.project.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;

// Davet linkleri: diyetisyen oluşturur, ödeme yapan kişi bir kez kullanır, 7 gün sonra geçersiz olur
@Service
public class InviteService {

    private static final int VALID_DAYS = 7;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final InviteRepository inviteRepository;
    private final UserRepository userRepository;
    private final Clock clock;

    public InviteService(InviteRepository inviteRepository, UserRepository userRepository, Clock clock) {
        this.inviteRepository = inviteRepository;
        this.userRepository = userRepository;
        this.clock = clock;
    }

    @Transactional
    public InviteResponse create(String dietitianUsername, InviteCreateRequest request) {
        ClientAccessService.requirePackageMonths(request.getMonths());
        User dietitian = userRepository.findByUsername(dietitianUsername)
                .orElseThrow(() -> new UserNotFoundException("Kullanıcı bulunamadı: " + dietitianUsername));
        String note = request.getNote() == null || request.getNote().isBlank() ? null : request.getNote().trim();
        LocalDateTime now = now();
        Invite invite = new Invite(dietitian, newToken(), note, request.getMonths(), now, now.plusDays(VALID_DAYS));
        return new InviteResponse(inviteRepository.save(invite));
    }

    // Kullanılmamış ve süresi dolmamış davetler, en yeni önce
    @Transactional(readOnly = true)
    public List<InviteResponse> listOpen() {
        return inviteRepository.findAllByUsedAtIsNullAndExpiresAtAfterOrderByCreatedAtDesc(now()).stream()
                .map(InviteResponse::new)
                .toList();
    }

    // Yalnızca kullanılmamış davet silinir (kullanılmış davet kimin hangi linkle geldiğini gösterir)
    @Transactional
    public void delete(Long id) {
        Invite invite = inviteRepository.findById(id).orElseThrow(InviteInvalidException::new);
        if (invite.getUsedAt() != null) {
            throw new InviteInvalidException();
        }
        inviteRepository.delete(invite);
    }

    // Kayıt sayfası linki kontrol eder
    @Transactional(readOnly = true)
    public InviteLookupResponse lookup(String token) {
        Invite invite = inviteRepository.findByToken(token).orElseThrow(InviteInvalidException::new);
        if (!invite.isUsable(now())) {
            throw new InviteInvalidException();
        }
        return new InviteLookupResponse(invite.getMonths());
    }

    // Kayıt sırasında: daveti kilitler ve geçerliyse döndürür. Çağıranın transaction'ı içinde kullanılmalı.
    public Invite lockUsable(String token) {
        Invite invite = inviteRepository.findByTokenForUpdate(token).orElseThrow(InviteInvalidException::new);
        if (!invite.isUsable(now())) {
            throw new InviteInvalidException();
        }
        return invite;
    }

    // Kayıt başarılı olduktan sonra davet kullanıldı olarak işaretlenir
    public void markUsed(Invite invite, User user) {
        invite.markUsed(user, now());
    }

    private LocalDateTime now() {
        return LocalDateTime.now(clock);
    }

    // 32 rastgele bayt → 43 karakterlik, URL'de güvenle kullanılabilen, tahmin edilemeyen token
    private static String newToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
