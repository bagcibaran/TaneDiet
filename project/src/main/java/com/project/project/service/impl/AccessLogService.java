package com.project.project.service.impl;

import com.project.project.dto.AccessLogResponse;
import com.project.project.entity.AccessLog;
import com.project.project.entity.Role;
import com.project.project.entity.User;
import com.project.project.exception.UserNotFoundException;
import com.project.project.repository.AccessLogRepository;
import com.project.project.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;

// KVKK erişim kaydı: diyetisyen bir danışanın sağlık bilgisini görünce / dışa aktarınca kim, kimi, ne zaman tutulur
@Service
public class AccessLogService {

    private final AccessLogRepository accessLogRepository;
    private final UserRepository userRepository;
    private final Clock clock;

    public AccessLogService(AccessLogRepository accessLogRepository, UserRepository userRepository, Clock clock) {
        this.accessLogRepository = accessLogRepository;
        this.userRepository = userRepository;
        this.clock = clock;
    }

    public void record(String viewerUsername, Long clientId, AccessLog.Action action) {
        User viewer = userRepository.findByUsername(viewerUsername)
                .orElseThrow(() -> new UserNotFoundException("Kullanıcı bulunamadı: " + viewerUsername));
        User client = findClientById(clientId);
        accessLogRepository.save(new AccessLog(viewer, client, action, LocalDateTime.now(clock)));
    }

    public List<AccessLogResponse> list(Long clientId) {
        return accessLogRepository.findAllByClientOrderByCreatedAtDesc(findClientById(clientId)).stream()
                .map(AccessLogResponse::new)
                .toList();
    }

    private User findClientById(Long clientId) {
        User user = userRepository.findById(clientId)
                .orElseThrow(() -> new UserNotFoundException("Danışan bulunamadı, id: " + clientId));

        if (user.getRole() != Role.CLIENT) {
            throw new UserNotFoundException("Danışan bulunamadı, id: " + clientId);
        }

        return user;
    }
}
