package com.compliance.sgc.service;

import com.compliance.sgc.domain.entity.Evidencia;
import com.compliance.sgc.domain.entity.Norma;
import com.compliance.sgc.domain.entity.Obrigacao;
import com.compliance.sgc.domain.entity.Usuario;
import com.compliance.sgc.dto.search.SearchResultDTO;
import com.compliance.sgc.repository.EvidenciaRepository;
import com.compliance.sgc.repository.NormaRepository;
import com.compliance.sgc.repository.ObrigacaoRepository;
import com.compliance.sgc.repository.UsuarioRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Serviço de busca global
 * Busca em todas as entidades do sistema
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class SearchService {

    private final NormaRepository normaRepository;
    private final ObrigacaoRepository obrigacaoRepository;
    private final EvidenciaRepository evidenciaRepository;
    private final UsuarioRepository usuarioRepository;
    private final EntityManager entityManager;

    private static final int MAX_RESULTS_PER_TYPE = 5;
    private static final int MAX_TOTAL_RESULTS = 20;

    /**
     * Realiza busca global no sistema
     *
     * @param query Termo de busca
     * @return Lista de resultados ordenados por relevância
     */
    public List<SearchResultDTO> search(String query) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }

        String searchTerm = "%" + query.trim().toLowerCase() + "%";
        log.info("Realizando busca global com termo: {}", query);

        List<SearchResultDTO> allResults = new ArrayList<>();

        // Busca em normas
        allResults.addAll(searchNormas(searchTerm));

        // Busca em obrigações
        allResults.addAll(searchObrigacoes(searchTerm));

        // Busca em evidências
        allResults.addAll(searchEvidencias(searchTerm));

        // Busca em usuários (apenas para ADMIN)
        if (isAdmin()) {
            allResults.addAll(searchUsuarios(searchTerm));
        }

        // Ordena por relevância e limita resultado total
        return allResults.stream()
            .sorted(Comparator.comparing(SearchResultDTO::tipo))
            .limit(MAX_TOTAL_RESULTS)
            .toList();
    }

    /**
     * Busca em normas
     */
    private List<SearchResultDTO> searchNormas(String searchTerm) {
        try {
            String jpql = """
                SELECT n FROM Norma n
                WHERE n.ativo = true
                AND (
                    LOWER(n.tipo) LIKE :searchTerm
                    OR LOWER(n.numero) LIKE :searchTerm
                    OR LOWER(n.titulo) LIKE :searchTerm
                    OR LOWER(n.ementa) LIKE :searchTerm
                )
                ORDER BY n.dataPublicacao DESC
                """;

            TypedQuery<Norma> query = entityManager.createQuery(jpql, Norma.class);
            query.setParameter("searchTerm", searchTerm);
            query.setMaxResults(MAX_RESULTS_PER_TYPE);

            return query.getResultList().stream()
                .map(norma -> SearchResultDTO.fromNorma(
                    norma.getNormaId(),
                    norma.getTipo(),
                    norma.getNumero(),
                    norma.getEmenta()
                ))
                .toList();
        } catch (Exception e) {
            log.error("Erro ao buscar normas: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Busca em obrigações
     */
    private List<SearchResultDTO> searchObrigacoes(String searchTerm) {
        try {
            String jpql = """
                SELECT o FROM Obrigacao o
                WHERE o.ativo = true
                AND (
                    LOWER(o.titulo) LIKE :searchTerm
                    OR LOWER(o.descricao) LIKE :searchTerm
                )
                ORDER BY o.prazoExecucao DESC
                """;

            TypedQuery<Obrigacao> query = entityManager.createQuery(jpql, Obrigacao.class);
            query.setParameter("searchTerm", searchTerm);
            query.setMaxResults(MAX_RESULTS_PER_TYPE);

            return query.getResultList().stream()
                .map(obrigacao -> SearchResultDTO.fromObrigacao(
                    obrigacao.getObrigacaoId(),
                    obrigacao.getTitulo(),
                    obrigacao.getDescricao()
                ))
                .toList();
        } catch (Exception e) {
            log.error("Erro ao buscar obrigações: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Busca em evidências
     */
    private List<SearchResultDTO> searchEvidencias(String searchTerm) {
        try {
            String jpql = """
                SELECT e FROM Evidencia e
                WHERE e.ativo = true
                AND (
                    LOWER(e.descricao) LIKE :searchTerm
                    OR LOWER(e.conteudoTexto) LIKE :searchTerm
                )
                ORDER BY e.dataUpload DESC
                """;

            TypedQuery<Evidencia> query = entityManager.createQuery(jpql, Evidencia.class);
            query.setParameter("searchTerm", searchTerm);
            query.setMaxResults(MAX_RESULTS_PER_TYPE);

            return query.getResultList().stream()
                .map(evidencia -> SearchResultDTO.fromEvidencia(
                    evidencia.getEvidenciaId(),
                    evidencia.getDescricao(),
                    evidencia.getConteudoTexto()
                ))
                .toList();
        } catch (Exception e) {
            log.error("Erro ao buscar evidências: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Busca em usuários (apenas ADMIN)
     */
    private List<SearchResultDTO> searchUsuarios(String searchTerm) {
        try {
            String jpql = """
                SELECT u FROM Usuario u
                WHERE u.ativo = true
                AND (
                    LOWER(u.nome) LIKE :searchTerm
                    OR LOWER(u.email) LIKE :searchTerm
                )
                ORDER BY u.nome
                """;

            TypedQuery<Usuario> query = entityManager.createQuery(jpql, Usuario.class);
            query.setParameter("searchTerm", searchTerm);
            query.setMaxResults(MAX_RESULTS_PER_TYPE);

            return query.getResultList().stream()
                .map(usuario -> SearchResultDTO.fromUsuario(
                    usuario.getUsuarioId(),
                    usuario.getNome(),
                    usuario.getEmail(),
                    usuario.getRole().name()
                ))
                .toList();
        } catch (Exception e) {
            log.error("Erro ao buscar usuários: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Verifica se o usuário autenticado é ADMIN
     */
    private boolean isAdmin() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return false;
            }

            return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        } catch (Exception e) {
            log.warn("Erro ao verificar role do usuário: {}", e.getMessage());
            return false;
        }
    }
}
