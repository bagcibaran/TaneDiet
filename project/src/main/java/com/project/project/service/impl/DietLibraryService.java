package com.project.project.service.impl;

import com.project.project.dto.DietLibraryResponse;
import com.project.project.dto.MealTemplateRequest;
import com.project.project.dto.MealTemplateResponse;
import com.project.project.dto.QuickPickCategoryRequest;
import com.project.project.dto.QuickPickCategoryResponse;
import com.project.project.dto.QuickPickItemRequest;
import com.project.project.dto.QuickPickItemResponse;
import com.project.project.entity.MealTemplate;
import com.project.project.entity.QuickPickCategory;
import com.project.project.entity.QuickPickItem;
import com.project.project.entity.User;
import com.project.project.exception.DietLibraryNotFoundException;
import com.project.project.exception.UserNotFoundException;
import com.project.project.repository.MealTemplateRepository;
import com.project.project.repository.QuickPickCategoryRepository;
import com.project.project.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

// Diyetisyenin hazır öğünleri ve hızlı maddeleri. Her kayıt diyetisyene aittir; başkasınınki 404.
@Service
public class DietLibraryService {

    private final MealTemplateRepository mealTemplateRepository;
    private final QuickPickCategoryRepository categoryRepository;
    private final DietLibrarySeeder seeder;
    private final UserRepository userRepository;

    public DietLibraryService(
            MealTemplateRepository mealTemplateRepository,
            QuickPickCategoryRepository categoryRepository,
            DietLibrarySeeder seeder,
            UserRepository userRepository
    ) {
        this.mealTemplateRepository = mealTemplateRepository;
        this.categoryRepository = categoryRepository;
        this.seeder = seeder;
        this.userRepository = userRepository;
    }

    // Hazır öğünler saate göre (saatsizler sonda), kategoriler kendi sırasıyla.
    // İlk açılışta örnekler bir kez yüklenir: önce (ayrı transaction'da) yükleme, sonra okuma.
    // Sıra önemli: okuma önce başlarsa eski anlık görüntüyü (yüklemeden önceki hâli) görür.
    @Transactional(readOnly = true)
    public DietLibraryResponse getLibrary(String ownerUsername) {
        seeder.seedIfNeeded(ownerUsername);
        User owner = findUserByUsername(ownerUsername);

        List<MealTemplateResponse> meals = mealTemplateRepository.findAllByOwner(owner).stream()
                .sorted(Comparator.comparing(MealTemplate::getMealTime, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(MealTemplate::getId, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(MealTemplateResponse::new)
                .toList();
        List<QuickPickCategoryResponse> categories = categoryRepository.findAllByOwnerOrderByPositionAscIdAsc(owner).stream()
                .map(QuickPickCategoryResponse::new)
                .toList();
        return new DietLibraryResponse(meals, categories);
    }

    // ---------- Hazır öğünler ----------

    @Transactional
    public MealTemplateResponse createMeal(String ownerUsername, MealTemplateRequest request) {
        User owner = findUserByUsername(ownerUsername);
        MealTemplate template = new MealTemplate(owner, request.getName().trim(), blankToNull(request.getTime()), cleanItems(request.getItems()));
        return new MealTemplateResponse(mealTemplateRepository.save(template));
    }

    @Transactional
    public MealTemplateResponse updateMeal(String ownerUsername, Long id, MealTemplateRequest request) {
        MealTemplate template = findMealOf(findUserByUsername(ownerUsername), id);
        template.setName(request.getName().trim());
        template.setMealTime(blankToNull(request.getTime()));
        template.setItems(cleanItems(request.getItems()));
        return new MealTemplateResponse(mealTemplateRepository.save(template));
    }

    @Transactional
    public void deleteMeal(String ownerUsername, Long id) {
        mealTemplateRepository.delete(findMealOf(findUserByUsername(ownerUsername), id));
    }

    // ---------- Kategoriler ----------

    @Transactional
    public QuickPickCategoryResponse createCategory(String ownerUsername, QuickPickCategoryRequest request) {
        User owner = findUserByUsername(ownerUsername);
        int position = categoryRepository.findMaxPosition(owner) + 1;
        QuickPickCategory category = new QuickPickCategory(owner, request.getName().trim(), position);
        return new QuickPickCategoryResponse(categoryRepository.save(category));
    }

    @Transactional
    public QuickPickCategoryResponse renameCategory(String ownerUsername, Long id, QuickPickCategoryRequest request) {
        QuickPickCategory category = findCategoryOf(findUserByUsername(ownerUsername), id);
        category.setName(request.getName().trim());
        return new QuickPickCategoryResponse(categoryRepository.save(category));
    }

    // Kategorinin maddeleri de silinir (cascade)
    @Transactional
    public void deleteCategory(String ownerUsername, Long id) {
        categoryRepository.delete(findCategoryOf(findUserByUsername(ownerUsername), id));
    }

    // ---------- Maddeler ----------

    @Transactional
    public QuickPickItemResponse addItem(String ownerUsername, Long categoryId, QuickPickItemRequest request) {
        QuickPickCategory category = findCategoryOf(findUserByUsername(ownerUsername), categoryId);
        QuickPickItem item = category.addItem(request.getText().trim());
        // Kategori zaten yönetiliyor: flush yeni maddeyi bu nesneyle kaydeder ve id'si yanıta gelir.
        // (save/merge ise maddenin bir kopyasını kaydeder, elimizdeki nesne id almazdı.)
        categoryRepository.flush();
        return new QuickPickItemResponse(item);
    }

    @Transactional
    public QuickPickItemResponse updateItem(String ownerUsername, Long itemId, QuickPickItemRequest request) {
        QuickPickItem item = findItemOf(findUserByUsername(ownerUsername), itemId);
        item.setText(request.getText().trim());
        return new QuickPickItemResponse(item);
    }

    @Transactional
    public void deleteItem(String ownerUsername, Long itemId) {
        QuickPickItem item = findItemOf(findUserByUsername(ownerUsername), itemId);
        // orphanRemoval: listeden çıkan madde veritabanından da silinir
        item.getCategory().getItems().remove(item);
    }

    // ---------- Yardımcılar ----------

    // Satırların başındaki/sonundaki boşlukları ve boş satırları temizler; boşsa ""
    private String cleanItems(String items) {
        if (items == null) {
            return "";
        }
        return Arrays.stream(items.split("\\R"))
                .map(String::trim)
                .filter(line -> !line.isEmpty())
                .collect(Collectors.joining("\n"));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private MealTemplate findMealOf(User owner, Long id) {
        return mealTemplateRepository.findByIdAndOwner(id, owner)
                .orElseThrow(() -> new DietLibraryNotFoundException("Kayıt bulunamadı"));
    }

    private QuickPickCategory findCategoryOf(User owner, Long id) {
        return categoryRepository.findByIdAndOwner(id, owner)
                .orElseThrow(() -> new DietLibraryNotFoundException("Kayıt bulunamadı"));
    }

    private QuickPickItem findItemOf(User owner, Long id) {
        return categoryRepository.findItemByIdAndOwner(id, owner)
                .orElseThrow(() -> new DietLibraryNotFoundException("Kayıt bulunamadı"));
    }

    private User findUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("Kullanıcı bulunamadı: " + username));
    }
}
