package com.campoapp.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;

import java.util.Map;

@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final T data;
    private final String error;
    private final Map<String, Object> metadata;

    private ApiResponse(T data, String error, Map<String, Object> metadata) {
        this.data = data;
        this.error = error;
        this.metadata = metadata;
    }

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(data, null, null);
    }

    public static <T> ApiResponse<T> ok(T data, Map<String, Object> metadata) {
        return new ApiResponse<>(data, null, metadata);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(null, message, null);
    }
}
