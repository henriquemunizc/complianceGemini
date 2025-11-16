package com.compliance.sgc.dto.search;

/**
 * DTO para resultado de busca global
 *
 * @param tipo Tipo da entidade (Normas, Obrigações, Evidências, Usuários)
 * @param id ID da entidade
 * @param titulo Título do resultado
 * @param snippet Trecho/descrição do resultado
 * @param url URL relativa para navegação
 */
public record SearchResultDTO(
    String tipo,
    Long id,
    String titulo,
    String snippet,
    String url
) {

    /**
     * Cria um resultado de busca para Norma
     */
    public static SearchResultDTO fromNorma(Long id, String tipo, String numero, String ementa) {
        String titulo = String.format("%s %s", tipo, numero);
        String snippet = ementa != null && ementa.length() > 150
            ? ementa.substring(0, 150) + "..."
            : ementa;
        String url = String.format("/normas/%d", id);

        return new SearchResultDTO("Normas", id, titulo, snippet, url);
    }

    /**
     * Cria um resultado de busca para Obrigação
     */
    public static SearchResultDTO fromObrigacao(Long id, String titulo, String descricao) {
        String snippet = descricao != null && descricao.length() > 150
            ? descricao.substring(0, 150) + "..."
            : descricao;
        String url = String.format("/obrigacoes/%d", id);

        return new SearchResultDTO("Obrigações", id, titulo, snippet, url);
    }

    /**
     * Cria um resultado de busca para Evidência
     */
    public static SearchResultDTO fromEvidencia(Long id, String descricao, String conteudoTexto) {
        String titulo = descricao != null && descricao.length() > 100
            ? descricao.substring(0, 100) + "..."
            : descricao;
        String snippet = conteudoTexto != null && conteudoTexto.length() > 150
            ? conteudoTexto.substring(0, 150) + "..."
            : conteudoTexto;
        String url = String.format("/evidencias/%d", id);

        return new SearchResultDTO("Evidências", id, titulo, snippet, url);
    }

    /**
     * Cria um resultado de busca para Usuário
     */
    public static SearchResultDTO fromUsuario(Long id, String nome, String email, String role) {
        String titulo = nome;
        String snippet = String.format("%s - %s", email, role);
        String url = String.format("/usuarios/%d", id);

        return new SearchResultDTO("Usuários", id, titulo, snippet, url);
    }
}
