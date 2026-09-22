package com.campoapp.agricultura;

import com.campoapp.agricultura.entity.Lote;
import com.campoapp.agricultura.ndvi.NdviProperties;
import com.campoapp.agricultura.ndvi.NdviService;
import com.campoapp.agricultura.repository.LoteRepository;
import com.campoapp.common.exception.ResourceNotFoundException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.web.client.RestClient;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class NdviServiceTest {

    @TempDir
    Path ndviDir;

    private LoteRepository loteRepository;
    private NdviService service;
    private Lote lote;

    @BeforeEach
    void setUp() {
        loteRepository = mock(LoteRepository.class);
        NdviProperties properties = new NdviProperties();
        properties.setDir(ndviDir.toString());
        service = new NdviService(
                loteRepository,
                properties,
                mock(com.campoapp.agricultura.ndvi.SentinelAuthClient.class),
                new ObjectMapper(),
                mock(RestClient.class)
        );
        lote = new Lote();
        lote.setId("lote-1");
        lote.setNombre("Lote Norte");
    }

    @Test
    void shouldExposeAvailableAndMissingImagesInManifest() throws Exception {
        Lote withoutImage = new Lote();
        withoutImage.setId("lote-2");
        withoutImage.setNombre("Lote Sur");
        Files.write(ndviDir.resolve("lote-1.png"), new byte[]{1, 2, 3});
        when(loteRepository.findAllActive()).thenReturn(List.of(lote, withoutImage));

        var manifest = service.listarManifest();

        assertThat(manifest).hasSize(2);
        assertThat(manifest.get(0).disponible()).isTrue();
        assertThat(manifest.get(0).version()).isNotBlank();
        assertThat(manifest.get(0).imagenUrl()).isEqualTo("/api/v1/agricola/ndvi/lote-1/imagen");
        assertThat(manifest.get(1).disponible()).isFalse();
        assertThat(manifest.get(1).version()).isNull();
    }

    @Test
    void shouldReturnImageOnlyForActiveLote() throws Exception {
        byte[] png = new byte[]{9, 8, 7};
        Files.write(ndviDir.resolve("lote-1.png"), png);
        when(loteRepository.findActiveById("lote-1")).thenReturn(Optional.of(lote));

        var image = service.obtenerImagen("lote-1");

        assertThat(Files.readAllBytes(image.path())).isEqualTo(png);
        assertThat(image.version()).isNotBlank();
        assertThat(image.generatedAt()).isNotNull();
    }

    @Test
    void shouldRejectImageForInactiveLote() {
        when(loteRepository.findActiveById("deleted")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.obtenerImagen("deleted"))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}

