package com.restaurant_pos.backend.menu;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class MenuExceptionHandler {
    @ExceptionHandler(MenuService.MenuNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, String> notFound(MenuService.MenuNotFoundException e) {
        return Map.of("error", e.getMessage());
    }
}
