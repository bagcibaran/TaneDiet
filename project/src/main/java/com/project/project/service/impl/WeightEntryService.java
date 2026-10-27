package com.project.project.service.impl;

import com.project.project.dto.WeightEntryCreateRequest;
import com.project.project.dto.WeightEntryResponse;
import com.project.project.dto.WeightPointResponse;
import com.project.project.dto.WeightSummaryResponse;
import com.project.project.entity.Role;
import com.project.project.entity.User;
import com.project.project.entity.WeightEntry;
import com.project.project.exception.UserNotFoundException;
import com.project.project.exception.WeightEntryNotFoundException;
import com.project.project.repository.UserRepository;
import com.project.project.repository.WeightEntryRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@Service
public class WeightEntryService {

    private final WeightEntryRepository weightEntryRepository;
    private final UserRepository userRepository;

    public WeightEntryService(WeightEntryRepository weightEntryRepository, UserRepository userRepository) {
        this.weightEntryRepository = weightEntryRepository;
        this.userRepository = userRepository;
    }

    // ---------- Danışan: kendi kayıtları ----------

    public WeightEntryResponse addMyEntry(String username, WeightEntryCreateRequest request) {
        User user = findUserByUsername(username);

        WeightEntry entry = new WeightEntry(
                user,
                request.getWeightKg(),
                request.getMeasuredOn(),
                user
        );

        WeightEntry savedEntry = weightEntryRepository.save(entry);
        return new WeightEntryResponse(savedEntry);
    }

    public List<WeightEntryResponse> getMyEntries(String username) {
        User user = findUserByUsername(username);

        return weightEntryRepository.findAllByUserOrderByMeasuredOnDescCreatedAtDesc(user)
                .stream()
                .map(WeightEntryResponse::new)
                .toList();
    }

    public void deleteMyEntry(String username, Long entryId) {
        User user = findUserByUsername(username);
        WeightEntry entry = findEntryOf(user, entryId);

        // Danışan yalnızca kendi girdiği kaydı silebilir; diyetisyenin girdiğini silemez
        if (!entry.getEnteredBy().getId().equals(user.getId())) {
            throw new AccessDeniedException("Diyetisyenin girdiği kayıtlar silinemez");
        }

        weightEntryRepository.delete(entry);
    }

    public WeightSummaryResponse getMySummary(String username) {
        return buildSummary(findUserByUsername(username));
    }

    // ---------- Diyetisyen: bir danışanın kayıtları ----------

    public List<WeightEntryResponse> getClientEntries(Long clientId) {
        User client = findClientById(clientId);

        return weightEntryRepository.findAllByUserOrderByMeasuredOnDescCreatedAtDesc(client)
                .stream()
                .map(WeightEntryResponse::new)
                .toList();
    }

    public WeightEntryResponse addEntryForClient(Long clientId, String dietitianUsername, WeightEntryCreateRequest request) {
        User client = findClientById(clientId);
        User dietitian = findUserByUsername(dietitianUsername);

        WeightEntry entry = new WeightEntry(
                client,
                request.getWeightKg(),
                request.getMeasuredOn(),
                dietitian
        );

        WeightEntry savedEntry = weightEntryRepository.save(entry);
        return new WeightEntryResponse(savedEntry);
    }

    public void deleteClientEntry(Long clientId, Long entryId) {
        User client = findClientById(clientId);
        WeightEntry entry = findEntryOf(client, entryId);

        weightEntryRepository.delete(entry);
    }

    public WeightSummaryResponse getClientSummary(Long clientId) {
        return buildSummary(findClientById(clientId));
    }

    // ---------- Özet hesabı ----------

    private WeightSummaryResponse buildSummary(User user) {
        // Repository kayıtları yeniden eskiye verir (önce tarih, aynı günde son girilen önce)
        List<WeightEntry> entries = weightEntryRepository.findAllByUserOrderByMeasuredOnDescCreatedAtDesc(user);

        // Her gün için tek kilo: o günün son girilen kaydı.
        // Liste yeniden eskiye sıralı olduğu için bir güne ilk rastladığımız kayıt o günün sonuncusu.
        // TreeMap anahtarları (tarihleri) eskiden yeniye kendisi sıralar.
        TreeMap<LocalDate, BigDecimal> dailyWeights = new TreeMap<>();
        for (WeightEntry entry : entries) {
            dailyWeights.putIfAbsent(entry.getMeasuredOn(), entry.getWeightKg());
        }

        // Grafiğin noktaları (eskiden yeniye)
        List<WeightPointResponse> points = new ArrayList<>();
        for (Map.Entry<LocalDate, BigDecimal> day : dailyWeights.entrySet()) {
            points.add(new WeightPointResponse(day.getKey(), day.getValue()));
        }

        // Hiç kayıt yoksa: hesaplanacak bir şey yok
        if (points.isEmpty()) {
            return new WeightSummaryResponse(null, null, null, null, null, points);
        }

        BigDecimal startWeight = points.get(0).getWeightKg();
        BigDecimal latestWeight = points.get(points.size() - 1).getWeightKg();

        // Tek bir gün varsa "başlangıçtan beri" anlamsız
        BigDecimal changeSinceStart = points.size() > 1 ? latestWeight.subtract(startWeight) : null;

        LocalDate today = LocalDate.now();

        return new WeightSummaryResponse(
                startWeight,
                latestWeight,
                changeSinceStart,
                changeSince(dailyWeights, latestWeight, today.minusDays(7)),
                changeSince(dailyWeights, latestWeight, today.minusDays(30)),
                points
        );
    }

    // Son kilo − (verilen tarihte veya ondan önceki en yakın günün kilosu). O tarihten önce kayıt yoksa null.
    private BigDecimal changeSince(TreeMap<LocalDate, BigDecimal> dailyWeights, BigDecimal latestWeight, LocalDate fromDate) {
        Map.Entry<LocalDate, BigDecimal> before = dailyWeights.floorEntry(fromDate);
        return before == null ? null : latestWeight.subtract(before.getValue());
    }

    // ---------- Yardımcılar ----------

    private User findUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("Kullanıcı bulunamadı: " + username));
    }

    private User findClientById(Long clientId) {
        User user = userRepository.findById(clientId)
                .orElseThrow(() -> new UserNotFoundException("Danışan bulunamadı, id: " + clientId));

        if (user.getRole() != Role.CLIENT) {
            throw new UserNotFoundException("Danışan bulunamadı, id: " + clientId);
        }

        return user;
    }

    // Kayıt yoksa veya bu kullanıcıya ait değilse 404
    private WeightEntry findEntryOf(User user, Long entryId) {
        return weightEntryRepository.findByIdAndUser(entryId, user)
                .orElseThrow(() -> new WeightEntryNotFoundException("Kilo kaydı bulunamadı, id: " + entryId));
    }
}