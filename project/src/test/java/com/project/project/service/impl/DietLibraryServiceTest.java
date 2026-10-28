package com.project.project.service.impl;

import com.project.project.dto.DietLibraryResponse;
import com.project.project.dto.MealTemplateRequest;
import com.project.project.dto.MealTemplateResponse;
import com.project.project.dto.QuickPickCategoryRequest;
import com.project.project.dto.QuickPickItemRequest;
import com.project.project.dto.QuickPickItemResponse;
import com.project.project.entity.MealTemplate;
import com.project.project.entity.QuickPickCategory;
import com.project.project.entity.Role;
import com.project.project.entity.User;
import com.project.project.exception.DietLibraryNotFoundException;
import com.project.project.repository.DietLibrarySeedRepository;
import com.project.project.repository.MealTemplateRepository;
import com.project.project.repository.QuickPickCategoryRepository;
import com.project.project.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

class DietLibraryServiceTest {

    @Mock
    private MealTemplateRepository mealTemplateRepository;

    @Mock
    private QuickPickCategoryRepository categoryRepository;

    @Mock
    private DietLibrarySeedRepository seedRepository;

    @Mock
    private DietLibrarySeeder seeder;

    @Mock
    private UserRepository userRepository;

    private DietLibraryService service;

    private User dietitian;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new DietLibraryService(mealTemplateRepository, categoryRepository, seeder, userRepository);

        dietitian = new User("diyetisyen", "d@test.com", "hash");
        dietitian.setId(28L);
        dietitian.setRole(Role.DIETITIAN);

        when(userRepository.findByUsername("diyetisyen")).thenReturn(Optional.of(dietitian));
        when(mealTemplateRepository.save(any(MealTemplate.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(categoryRepository.save(any(QuickPickCategory.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    private MealTemplate template(long id, String name, String time) {
        MealTemplate template = new MealTemplate(dietitian, name, time, "");
        template.setId(id);
        return template;
    }

    @SuppressWarnings("unchecked")
    @Test
    void seedsOnlyWhenMarkerInserted() {
        DietLibrarySeeder realSeeder = new DietLibrarySeeder(mealTemplateRepository, categoryRepository, seedRepository, userRepository);
        when(seedRepository.insertIfAbsent(28L)).thenReturn(1);

        realSeeder.seedIfNeeded("diyetisyen");

        ArgumentCaptor<List<MealTemplate>> meals = ArgumentCaptor.forClass(List.class);
        verify(mealTemplateRepository).saveAll(meals.capture());
        assertEquals(7, meals.getValue().size());
        assertEquals("", meals.getValue().get(0).getItems());

        ArgumentCaptor<List<QuickPickCategory>> categories = ArgumentCaptor.forClass(List.class);
        verify(categoryRepository).saveAll(categories.capture());
        assertEquals(8, categories.getValue().size());
        assertEquals("Kahvaltılık", categories.getValue().get(0).getName());
        assertEquals(8, categories.getValue().get(0).getItems().size());

        // İkinci okumada işaret zaten var: tekrar yüklenmez
        reset(mealTemplateRepository, categoryRepository);
        when(seedRepository.insertIfAbsent(28L)).thenReturn(0);
        realSeeder.seedIfNeeded("diyetisyen");
        verify(mealTemplateRepository, never()).saveAll(anyList());
        verify(categoryRepository, never()).saveAll(anyList());
    }

    // Örnekler okumadan önce (ayrı transaction'da) yüklenmeli; yoksa aynı anda gelen ikinci istek boş liste görür
    @Test
    void seedsBeforeReadingLibrary() {
        service.getLibrary("diyetisyen");

        InOrder order = inOrder(seeder, userRepository, mealTemplateRepository);
        order.verify(seeder).seedIfNeeded("diyetisyen");
        order.verify(userRepository).findByUsername("diyetisyen");
        order.verify(mealTemplateRepository).findAllByOwner(dietitian);
    }

    @Test
    void doesNotReseedAfterEverythingDeleted() {
        DietLibrarySeeder realSeeder = new DietLibrarySeeder(mealTemplateRepository, categoryRepository, seedRepository, userRepository);
        when(seedRepository.insertIfAbsent(28L)).thenReturn(0);
        realSeeder.seedIfNeeded("diyetisyen");

        DietLibraryResponse library = service.getLibrary("diyetisyen");

        assertTrue(library.getMeals().isEmpty());
        assertTrue(library.getCategories().isEmpty());
        verify(mealTemplateRepository, never()).saveAll(anyList());
    }

    @Test
    void mealsSortedByTimeNullsLast() {
        when(mealTemplateRepository.findAllByOwner(dietitian)).thenReturn(List.of(
                template(1L, "Öğle", "13:00"),
                template(2L, "Gece", null),
                template(3L, "Kahvaltı", "09:00")
        ));

        List<MealTemplateResponse> meals = service.getLibrary("diyetisyen").getMeals();

        assertEquals(List.of(3L, 1L, 2L), meals.stream().map(MealTemplateResponse::getId).toList());
    }

    @Test
    void createMealTrimsAndBlankTimeIsNull() {
        MealTemplateRequest request = new MealTemplateRequest();
        request.setName("  Kahvaltı ");
        request.setTime(" ");
        request.setItems("a\n\n b \n");

        MealTemplateResponse meal = service.createMeal("diyetisyen", request);

        assertEquals("Kahvaltı", meal.getName());
        assertNull(meal.getTime());
        assertEquals("a\nb", meal.getItems());
    }

    @Test
    void updateMealOfAnotherOwnerIs404() {
        when(mealTemplateRepository.findByIdAndOwner(99L, dietitian)).thenReturn(Optional.empty());
        MealTemplateRequest request = new MealTemplateRequest();
        request.setName("Kahvaltı");

        assertThrows(DietLibraryNotFoundException.class, () -> service.updateMeal("diyetisyen", 99L, request));
    }

    @Test
    void deleteCategoryRemovesItems() {
        QuickPickCategory category = new QuickPickCategory(dietitian, "Protein", 0);
        category.addItem("120 gr ızgara balık");
        when(categoryRepository.findByIdAndOwner(5L, dietitian)).thenReturn(Optional.of(category));

        service.deleteCategory("diyetisyen", 5L);

        // Maddeler cascade ile kategoriyle birlikte silinir
        verify(categoryRepository).delete(category);
    }

    @Test
    void addItemAppendsAtEnd() {
        QuickPickCategory category = new QuickPickCategory(dietitian, "Süt ürünleri", 0);
        category.addItem("1 su bardağı ayran");
        category.addItem("1 su bardağı kefir");
        when(categoryRepository.findByIdAndOwner(5L, dietitian)).thenReturn(Optional.of(category));
        QuickPickItemRequest request = new QuickPickItemRequest();
        request.setText("  1 kase yoğurt ");

        QuickPickItemResponse item = service.addItem("diyetisyen", 5L, request);

        assertEquals("1 kase yoğurt", item.getText());
        assertEquals(3, category.getItems().size());
        assertEquals(2, category.getItems().get(2).getPosition());
        // merge değil flush: yeni madde aynı nesne olarak kaydedilir ve id'si yanıta gelir
        verify(categoryRepository).flush();
        verify(categoryRepository, never()).saveAndFlush(any());
    }

    // Silmeden sonra eklenen madde de sona gider (pozisyon = en büyük + 1, sayı değil)
    @Test
    void addItemAfterDeleteGoesToEnd() {
        QuickPickCategory category = new QuickPickCategory(dietitian, "Meyve", 0);
        category.addItem("1 adet muz");
        category.addItem("1 KB armut");
        category.addItem("2 KB mandalina");
        category.getItems().remove(0);
        when(categoryRepository.findByIdAndOwner(5L, dietitian)).thenReturn(Optional.of(category));
        QuickPickItemRequest request = new QuickPickItemRequest();
        request.setText("1 KB yeşil elma");

        service.addItem("diyetisyen", 5L, request);

        assertEquals(3, category.getItems().get(2).getPosition());
    }

    @Test
    void createCategoryAfterDeleteGoesToEnd() {
        when(categoryRepository.findMaxPosition(dietitian)).thenReturn(4);
        QuickPickCategoryRequest request = new QuickPickCategoryRequest();
        request.setName("Çorbalar");

        service.createCategory("diyetisyen", request);

        ArgumentCaptor<QuickPickCategory> saved = ArgumentCaptor.forClass(QuickPickCategory.class);
        verify(categoryRepository).save(saved.capture());
        assertEquals(5, saved.getValue().getPosition());
    }

    @Test
    void updateItemOfAnotherOwnerIs404() {
        when(categoryRepository.findItemByIdAndOwner(77L, dietitian)).thenReturn(Optional.empty());
        QuickPickItemRequest request = new QuickPickItemRequest();
        request.setText("x");

        assertThrows(DietLibraryNotFoundException.class, () -> service.updateItem("diyetisyen", 77L, request));
    }
}
