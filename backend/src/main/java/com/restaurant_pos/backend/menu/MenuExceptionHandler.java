package com.restaurant_pos.backend.menu;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestControllerAdvice
public class MenuExceptionHandler {
    @ExceptionHandler(MenuService.MenuNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, String> notFound(MenuService.MenuNotFoundException e) { return Map.of("error", e.getMessage()); }
}
