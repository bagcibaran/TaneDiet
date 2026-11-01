package com.project.project.service.impl;

import com.project.project.dto.ClientActivityResponse;
import com.project.project.dto.ClientOverviewResponse;
import com.project.project.dto.UserResponse;
import com.project.project.entity.ClientReview;
import com.project.project.entity.IntakeForm;
import com.project.project.entity.Role;
import com.project.project.entity.User;
import com.project.project.entity.WeightEntry;
import com.project.project.exception.UserNotFoundException;
import com.project.project.repository.ClientReviewRepository;
import com.project.project.repository.DietPlanRepository;
import com.project.project.repository.IntakeFormRepository;
import com.project.project.repository.UserRepository;
import com.project.project.repository.WeightEntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

// Diyetisyen bildirimleri: danışan, diyetisyen en son baktığından beri ne değiştirdi?
@Service
public class ClientReviewService {

    // Diyetisyen bir danışana hiç bakmadıysa her şey yenidir
    static final LocalDateTime NEVER = LocalDateTime.of(1970, 1, 1, 0, 0);

    private final UserRepository userRepository;
    private final ClientReviewRepository clientReviewRepository;
    private final IntakeFormRepository intakeFormRepository;
    private final WeightEntryRepository weightEntryRepository;
    private final DietPlanRepository dietPlanRepository;
    private final ClientAccessService clientAccessService;

    public ClientReviewService(
            UserRepository userRepository,
            ClientReviewRepository clientReviewRepository,
            IntakeFormRepository intakeFormRepository,
            WeightEntryRepository weightEntryRepository,
            DietPlanRepository dietPlanRepository,
            ClientAccessService clientAccessService
    ) {
        this.userRepository = userRepository;
        this.clientReviewRepository = clientReviewRepository;
        this.intakeFormRepository = intakeFormRepository;
        this.weightEntryRepository = weightEntryRepository;
        this.dietPlanRepository = dietPlanRepository;
        this.clientAccessService = clientAccessService;
    }

    // Danışan listesi: her kart için bildirimler. Danışan sayısı ne olursa olsun sabit sayıda sorgu (danışan başına sorgu yok).
    public List<ClientOverviewResponse> listClients() {
        List<User> clients = userRepository.findAllByRoleOrderByUsernameAsc(Role.CLIENT);
        if (clients.isEmpty()) {
            return List.of();
        }

        Map<Long, ClientReview> reviews = clientReviewRepository.findAllByClientIn(clients).stream()
                .collect(Collectors.toMap(review -> review.getClient().getId(), Function.identity()));
        Map<Long, IntakeForm> forms = intakeFormRepository.findAllByUserIn(clients).stream()
                .collect(Collectors.toMap(form -> form.getUser().getId(), Function.identity()));
        Set<Long> withPlan = new HashSet<>(dietPlanRepository.findClientIdsWithPlan());
        // Yalnızca danışanın kendi girdiği kilolar; diyetisyenin girdiklerini zaten biliyor
        Map<Long, Long> newWeights = new HashMap<>();
        for (Object[] row : weightEntryRepository.countNewClientWeights()) {
            newWeights.put((Long) row[0], (Long) row[1]);
        }

        return clients.stream()
                .map(client -> new ClientOverviewResponse(
                        client,
                        newWeights.getOrDefault(client.getId(), 0L),
                        intakeStatus(Optional.ofNullable(forms.get(client.getId())), Optional.ofNullable(reviews.get(client.getId()))),
                        withPlan.contains(client.getId()),
                        clientAccessService.toResponse(client)))
                .toList();
    }

    // Danışan sayfasının başlığı için tek danışan (danışan değilse 404)
    public UserResponse getClient(Long clientId) {
        return new UserResponse(findClientById(clientId));
    }

    // Danışan sayfasında neyin yeni olduğunu söyler (henüz "görüldü" yapmaz)
    public ClientActivityResponse getActivity(Long clientId) {
        User client = findClientById(clientId);
        Optional<ClientReview> review = clientReviewRepository.findByClient(client);
        Optional<IntakeForm> form = intakeFormRepository.findByUser(client);

        List<Long> newWeightIds = weightEntryRepository
                .findAllByUserAndEnteredByAndCreatedAtAfter(client, client, since(review))
                .stream()
                .map(WeightEntry::getId)
                .toList();
        List<String> changedFields = form.map(IntakeForm::getChangedFields).orElse(List.of());

        return new ClientActivityResponse(newWeightIds, intakeStatus(form, review), changedFields);
    }

    // Diyetisyen danışanın sayfasını açtı: bildirimler kaybolur
    @Transactional
    public void markReviewed(Long clientId) {
        User client = findClientById(clientId);

        ClientReview review = clientReviewRepository.findByClient(client).orElseGet(() -> new ClientReview(client));
        review.markReviewed();
        clientReviewRepository.save(review);

        intakeFormRepository.findByUser(client).ifPresent(form -> {
            form.clearChangedFields();
            intakeFormRepository.save(form);
        });
    }

    private LocalDateTime since(Optional<ClientReview> review) {
        return review.map(ClientReview::getReviewedAt).orElse(NEVER);
    }

    private String intakeStatus(Optional<IntakeForm> form, Optional<ClientReview> review) {
        if (form.isEmpty()) {
            return "MISSING";
        }
        if (review.isEmpty() || form.get().getCreatedAt().isAfter(review.get().getReviewedAt())) {
            return "NEW";
        }
        if (!form.get().getChangedFields().isEmpty()) {
            return "UPDATED";
        }
        return "SEEN";
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
