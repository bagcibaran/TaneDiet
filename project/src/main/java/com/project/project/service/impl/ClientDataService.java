package com.project.project.service.impl;

import com.project.project.dto.ClientExportResponse;
import com.project.project.dto.DietPlanResponse;
import com.project.project.dto.IntakeFormResponse;
import com.project.project.dto.UserResponse;
import com.project.project.dto.WeightEntryResponse;
import com.project.project.entity.AccessLog;
import com.project.project.entity.DeletionRecord;
import com.project.project.entity.Role;
import com.project.project.entity.User;
import com.project.project.exception.AccessRuleException;
import com.project.project.exception.UserNotFoundException;
import com.project.project.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;

// KVKK: danışanın verilerini dışa aktarma ve kalıcı silme (talep üzerine ya da saklama süresi dolunca)
@Service
public class ClientDataService {

    private final UserRepository userRepository;
    private final AccessLogRepository accessLogRepository;
    private final ConsentRecordRepository consentRecordRepository;
    private final WeightEntryRepository weightEntryRepository;
    private final DietPlanRepository dietPlanRepository;
    private final ClientReviewRepository clientReviewRepository;
    private final IntakeFormRepository intakeFormRepository;
    private final TaskRepository taskRepository;
    private final InviteRepository inviteRepository;
    private final DeletionRecordRepository deletionRecordRepository;
    private final AccessLogService accessLogService;
    private final ConsentService consentService;
    private final Clock clock;

    public ClientDataService(
            UserRepository userRepository,
            AccessLogRepository accessLogRepository,
            ConsentRecordRepository consentRecordRepository,
            WeightEntryRepository weightEntryRepository,
            DietPlanRepository dietPlanRepository,
            ClientReviewRepository clientReviewRepository,
            IntakeFormRepository intakeFormRepository,
            TaskRepository taskRepository,
            InviteRepository inviteRepository,
            DeletionRecordRepository deletionRecordRepository,
            AccessLogService accessLogService,
            ConsentService consentService,
            Clock clock
    ) {
        this.userRepository = userRepository;
        this.accessLogRepository = accessLogRepository;
        this.consentRecordRepository = consentRecordRepository;
        this.weightEntryRepository = weightEntryRepository;
        this.dietPlanRepository = dietPlanRepository;
        this.clientReviewRepository = clientReviewRepository;
        this.intakeFormRepository = intakeFormRepository;
        this.taskRepository = taskRepository;
        this.inviteRepository = inviteRepository;
        this.deletionRecordRepository = deletionRecordRepository;
        this.accessLogService = accessLogService;
        this.consentService = consentService;
        this.clock = clock;
    }

    // Dışa aktarma da bir erişimdir: önce kaydedilir, böylece belgedeki erişim listesinde kendisi de görünür
    @Transactional
    public ClientExportResponse export(Long clientId, String dietitianUsername) {
        User client = findClientById(clientId);
        accessLogService.record(dietitianUsername, clientId, AccessLog.Action.EXPORT);

        return new ClientExportResponse(
                new UserResponse(client),
                client.getAccessUntil(),
                intakeFormRepository.findByUser(client).map(IntakeFormResponse::new).orElse(null),
                consentService.history(client),
                weightEntryRepository.findAllByUserOrderByMeasuredOnDescCreatedAtDesc(client).stream()
                        .map(WeightEntryResponse::new)
                        .toList(),
                dietPlanRepository.findAllByClientOrderByCreatedAtDesc(client).stream()
                        .map(DietPlanResponse::new)
                        .toList(),
                accessLogService.list(clientId),
                LocalDateTime.now(clock)
        );
    }

    // Danışan WhatsApp'tan silme istedi: diyetisyen kullanıcı adını aynen yazarak onaylar
    @Transactional
    public void deleteOnRequest(Long clientId, String dietitianUsername, String confirmUsername) {
        User client = findClientById(clientId);
        if (!client.getUsername().equals(confirmUsername)) {
            throw new AccessRuleException("Onay için danışanın kullanıcı adını aynen yaz");
        }
        User dietitian = userRepository.findByUsername(dietitianUsername)
                .orElseThrow(() -> new UserNotFoundException("Kullanıcı bulunamadı: " + dietitianUsername));

        deleteClientData(client, dietitian, DeletionRecord.Reason.REQUEST);
    }

    // Saklama süresi (gece işi): danışan bu transaction içinde yeniden okunur. Bu arada paketi uzatıldıysa
    // ya da zaten silindiyse dokunulmaz. true = silindi.
    @Transactional
    public boolean deleteExpired(Long clientId, LocalDate cutoff) {
        User client = userRepository.findById(clientId).orElse(null);
        if (client == null || client.getRole() != Role.CLIENT
                || client.getAccessUntil() == null || !client.getAccessUntil().isBefore(cutoff)) {
            return false;
        }
        deleteClientData(client, null, DeletionRecord.Reason.RETENTION);
        return true;
    }

    // Yabancı anahtarlar yüzünden sıra önemli: danışana bağlı her şey önce, kullanıcı en son.
    // Geriye yalnızca kişisel veri içermeyen silme kaydı kalır (numara, silen, sebep, zaman).
    @Transactional
    public void deleteClientData(User client, User actor, DeletionRecord.Reason reason) {
        Long clientId = client.getId();

        accessLogRepository.deleteAllByClient(client);
        consentRecordRepository.deleteAllByUser(client);
        weightEntryRepository.deleteAllByUser(client);
        dietPlanRepository.deleteAll(dietPlanRepository.findAllByClientOrderByCreatedAtDesc(client));
        clientReviewRepository.deleteAllByClient(client);
        intakeFormRepository.deleteAllByUser(client);
        taskRepository.deleteAllByUser(client);
        inviteRepository.clearUsedBy(client);
        userRepository.delete(client);

        deletionRecordRepository.save(new DeletionRecord(clientId, actor, reason, LocalDateTime.now(clock)));
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
