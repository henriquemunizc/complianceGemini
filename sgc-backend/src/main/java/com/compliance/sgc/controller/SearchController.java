package com.compliance.sgc.controller;

import com.compliance.sgc.dto.search.SearchResultDTO;
import com.compliance.sgc.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller REST para busca global
 * Endpoint: /api/v1/search
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Search", description = "API de Busca Global")
@SecurityRequirement(name = "bearer-jwt")
public class SearchController {

    private final SearchService searchService;

    /**
     * Busca global no sistema
     * Busca em: Normas, Obrigações, Evidências, Usuários (apenas ADMIN)
     *
     * @param query Termo de busca
     * @return Lista de resultados
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR', 'ANALISTA', 'AUDITOR')")
    @Operation(
        summary = "Busca global",
        description = "Realiza busca em todas as entidades do sistema (Normas, Obrigações, Evidências, Usuários). " +
                      "Retorna no máximo 5 resultados por tipo, totalizando até 20 resultados. " +
                      "Busca em usuários disponível apenas para ADMIN."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Busca realizada com sucesso",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = SearchResultDTO.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Parâmetro de busca inválido",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Não autenticado",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Sem permissão",
            content = @Content
        )
    })
    public ResponseEntity<List<SearchResultDTO>> search(
        @Parameter(description = "Termo de busca (mínimo 1 caractere)", required = true, example = "lei")
        @RequestParam("q") String query
    ) {
        log.info("GET /api/v1/search - query: {}", query);

        // Validação
        if (query == null || query.trim().isEmpty()) {
            log.warn("Termo de busca vazio");
            return ResponseEntity.badRequest().build();
        }

        if (query.trim().length() > 200) {
            log.warn("Termo de busca muito longo: {} caracteres", query.length());
            return ResponseEntity.badRequest().build();
        }

        // Executa busca
        List<SearchResultDTO> results = searchService.search(query);

        log.info("Busca retornou {} resultados para query '{}'", results.size(), query);
        return ResponseEntity.ok(results);
    }

    /**
     * Health check do serviço de busca
     */
    @GetMapping("/health")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR', 'ANALISTA', 'AUDITOR')")
    @Operation(
        summary = "Health check",
        description = "Verifica se o serviço de busca está disponível"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Serviço disponível",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Não autenticado",
            content = @Content
        )
    })
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Search service is running");
    }
}
