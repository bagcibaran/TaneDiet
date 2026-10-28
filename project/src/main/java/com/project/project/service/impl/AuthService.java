package com.project.project.service.impl;

import com.project.project.dto.LoginRequest;
import com.project.project.dto.LoginResponse;
import com.project.project.dto.RegisterRequest;
import com.project.project.dto.UserResponse;
import com.project.project.entity.Invite;
import com.project.project.entity.User;
import com.project.project.exception.AccessRuleException;
import com.project.project.exception.ClientAccessLockedException;
import com.project.project.exception.InviteInvalidException;
import com.project.project.exception.UserNotFoundException;
import com.project.project.repository.UserRepository;
import com.project.project.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final InviteService inviteService;
    private final ClientAccessService clientAccessService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            InviteService inviteService,
            ClientAccessService clientAccessService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.inviteService = inviteService;
        this.clientAccessService = clientAccessService;
    }

    // Kayıt yalnızca davetle: hizmet süresi bugünden itibaren davetteki paket kadar.
    // Sıra önemli: önce davet kilitlenip kontrol edilir, sonra kullanıcı kaydedilir, en son davet kullanıldı sayılır.
    // Kayıt başarısız olursa (ör. e-posta kayıtlı) her şey geri alınır ve davet tekrar kullanılabilir.
    @Transactional
    public UserResponse register(RegisterRequest request) {
        Invite invite;
        try {
            invite = inviteService.lockUsable(request.getInviteToken());
        } catch (InviteInvalidException e) {
            // Kayıtta geçersiz davet bir istek hatasıdır (400); bakış endpoint'inde 404
            throw new AccessRuleException(InviteInvalidException.MESSAGE);
        }

        User user = new User(request.getUsername(), request.getEmail(), passwordEncoder.encode(request.getPassword()));
        user.setAccessUntil(clientAccessService.today().plusMonths(invite.getMonths()));
        User saved = userRepository.save(user);
        inviteService.markUsed(invite, saved);
        return new UserResponse(saved);
    }

    public LoginResponse login(LoginRequest request) {
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isEmpty()) {
            throw new UserNotFoundException("Email veya şifre hatalı");
        }

        User user = existingUser.get();

        boolean passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if (!passwordMatches) {
            throw new UserNotFoundException("Email veya şifre hatalı");
        }

        // Hizmet süresi dolan danışan giriş yapamaz (verileri silinmez; diyetisyen açınca devam eder)
        if (clientAccessService.isLocked(user)) {
            throw new ClientAccessLockedException();
        }

        String token = jwtService.generateToken(user);
        return new LoginResponse(token, "Giriş Başarılı", user.getRole());
    }
}
