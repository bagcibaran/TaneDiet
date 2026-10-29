package com.project.project.exception;

import com.project.project.dto.ErrorResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult().getFieldError().getDefaultMessage();
        ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), errorMessage);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(TaskNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleTaskNotFound(TaskNotFoundException ex) {
        ErrorResponse error = new ErrorResponse(HttpStatus.NOT_FOUND.value(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(WeightEntryNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleWeightEntryNotFound(WeightEntryNotFoundException ex) {
        ErrorResponse error = new ErrorResponse(HttpStatus.NOT_FOUND.value(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(DietPlanInvalidException.class)
    public ResponseEntity<ErrorResponse> handleDietPlanInvalid(DietPlanInvalidException ex) {
        ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(DietPlanInvalidException.NotFound.class)
    public ResponseEntity<ErrorResponse> handleDietPlanNotFound(DietPlanInvalidException.NotFound ex) {
        ErrorResponse error = new ErrorResponse(HttpStatus.NOT_FOUND.value(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(DietLibraryNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleDietLibraryNotFound(DietLibraryNotFoundException ex) {
        ErrorResponse error = new ErrorResponse(HttpStatus.NOT_FOUND.value(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(IntakeConsentRequiredException.class)
    public ResponseEntity<ErrorResponse> handleIntakeConsentRequired(IntakeConsentRequiredException ex) {
        ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(AccessRuleException.class)
    public ResponseEntity<ErrorResponse> handleAccessRule(AccessRuleException ex) {
        ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(InviteInvalidException.class)
    public ResponseEntity<ErrorResponse> handleInviteInvalid(InviteInvalidException ex) {
        ErrorResponse error = new ErrorResponse(HttpStatus.NOT_FOUND.value(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    // Hizmet süresi dolan danışan: 423 (frontend giriş sayfasında özel mesaj gösterir)
    @ExceptionHandler(ClientAccessLockedException.class)
    public ResponseEntity<ErrorResponse> handleClientAccessLocked(ClientAccessLockedException ex) {
        ErrorResponse error = new ErrorResponse(HttpStatus.LOCKED.value(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.LOCKED).body(error);
    }

    // Çok fazla deneme (giriş, kayıt, davet kontrolü) → 429
    @ExceptionHandler(TooManyAttemptsException.class)
    public ResponseEntity<ErrorResponse> handleTooManyAttempts(TooManyAttemptsException ex) {
        ErrorResponse error = new ErrorResponse(HttpStatus.TOO_MANY_REQUESTS.value(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(error);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(UserNotFoundException ex) {
        ErrorResponse error = new ErrorResponse(HttpStatus.NOT_FOUND.value(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        ErrorResponse error = new ErrorResponse(HttpStatus.FORBIDDEN.value(), "Bu işlem için yetkiniz yok");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        // Veritabanının hata mesajı, ihlal edilen kısıtın adını içerir (V2__ migration'ındaki isimler)
        String cause = ex.getMostSpecificCause().getMessage();
        String message;
        if (cause.contains("uk_app_user_email")) {
            message = "Bu e-posta adresi zaten kayıtlı";
        } else if (cause.contains("uk_app_user_username")) {
            message = "Bu kullanıcı adı zaten alınmış";
        } else if (cause.contains("foreign key constraint fails")) {
            message = "Bu kullanıcıya ait görevler olduğu için silinemez";
        } else {
            message = "İşlem veri kurallarına uymuyor";
        }
        ErrorResponse error = new ErrorResponse(HttpStatus.CONFLICT.value(), message);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }
}