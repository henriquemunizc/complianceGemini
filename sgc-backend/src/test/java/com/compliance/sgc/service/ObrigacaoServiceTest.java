package com.compliance.sgc.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.compliance.sgc.domain.entity.*;
import com.compliance.sgc.domain.enums.PerfilUsuario;
import com.compliance.sgc.domain.enums.StatusObrigacao;
import com.compliance.sgc.dto.obrigacao.ObrigacaoCreateDTO;
import com.compliance.sgc.dto.obrigacao.ObrigacaoResponseDTO;
import com.compliance.sgc.dto.obrigacao.ObrigacaoUpdateDTO;
import com.compliance.sgc.dto.obrigacao.VinculoHierarquiaDTO;
import com.compliance.sgc.exception.BusinessValidationException;
import com.compliance.sgc.exception.EntityNotFoundException;
import com.compliance.sgc.exception.UnauthorizedException;
import com.compliance.sgc.mapper.ObrigacaoMapper;
import com.compliance.sgc.repository.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

@ExtendWith(MockitoExtension.class)
@DisplayName("ObrigacaoService - Testes Unitários")
class ObrigacaoServiceTest {

  @Mock private ObrigacaoRepository obrigacaoRepository;
  @Mock private UsuarioRepository usuarioRepository;
  @Mock private NormaRepository normaRepository;
  @Mock private ArtigoRepository artigoRepository;
  @Mock private IncisoRepository incisoRepository;
  @Mock private AlineaRepository alineaRepository;
  @Mock private ObrigacaoHierarquiaRepository hierarquiaRepository;
  @Mock private HistoricoStatusRepository historicoRepository;
  @Mock private ObrigacaoMapper mapper;
  @Mock private SecurityContext securityContext;
  @Mock private Authentication authentication;

  @InjectMocks private ObrigacaoService obrigacaoService;

  private Usuario responsavelAtivo;
  private Usuario compliance;
  private Obrigacao obrigacao;
  private Norma norma;

  @BeforeEach
  void setUp() {
    // Setup usuário responsável ativo
    responsavelAtivo = new Usuario();
    responsavelAtivo.setUsuarioId(1L);
    responsavelAtivo.setNome("João Silva");
    responsavelAtivo.setEmail("joao@example.com");
    responsavelAtivo.setPerfil(PerfilUsuario.ROLE_RESPONSAVEL);
    responsavelAtivo.setAtivo(true);

    // Setup usuário compliance
    compliance = new Usuario();
    compliance.setUsuarioId(2L);
    compliance.setNome("Maria Compliance");
    compliance.setEmail("maria@example.com");
    compliance.setPerfil(PerfilUsuario.ROLE_COMPLIANCE);
    compliance.setAtivo(true);

    // Setup norma
    norma = new Norma();
    norma.setNormaId(1L);
    norma.setTitulo("Lei 12.345/2023");
    norma.setAtivo(true);

    // Setup obrigação
    obrigacao = new Obrigacao();
    obrigacao.setObrigacaoId(1L);
    obrigacao.setTitulo("Obrigação Teste");
    obrigacao.setDescricao("Descrição da obrigação");
    obrigacao.setPrazoExecucao(LocalDate.now().plusDays(30));
    obrigacao.setResponsavel(responsavelAtivo);
    obrigacao.setStatus(StatusObrigacao.PENDENTE);
    obrigacao.setAtivo(true);
    obrigacao.setEvidencias(new ArrayList<>());
    obrigacao.setVinculosHierarquia(new ArrayList<>());

    // Mock SecurityContext
    when(securityContext.getAuthentication()).thenReturn(authentication);
    SecurityContextHolder.setContext(securityContext);
  }

  @Nested
  @DisplayName("Criar Obrigação")
  class CriarObrigacaoTests {

    @Test
    @DisplayName("Deve criar obrigação quando dados válidos")
    void deveCriarObrigacaoQuandoDadosValidos() {
      // Given
      VinculoHierarquiaDTO vinculo = new VinculoHierarquiaDTO(1L, null, null, null);
      ObrigacaoCreateDTO dto =
          new ObrigacaoCreateDTO(
              "Nova Obrigação",
              "Descrição completa",
              LocalDate.now().plusDays(30),
              null,
              1L,
              List.of(vinculo));

      when(usuarioRepository.findById(1L)).thenReturn(Optional.of(responsavelAtivo));
      when(normaRepository.findById(1L)).thenReturn(Optional.of(norma));
      when(mapper.toEntity(dto)).thenReturn(obrigacao);
      when(obrigacaoRepository.save(any(Obrigacao.class))).thenReturn(obrigacao);
      when(mapper.toResponseDTO(obrigacao)).thenReturn(new ObrigacaoResponseDTO(null, null, null, null, null, null, null, null, null, null, null, null, null, null));
      when(authentication.getName()).thenReturn("admin@example.com");
      when(usuarioRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(compliance));

      // When
      ObrigacaoResponseDTO result = obrigacaoService.criar(dto);

      // Then
      assertThat(result).isNotNull();
      verify(obrigacaoRepository, times(1)).save(any(Obrigacao.class));
      verify(historicoRepository, times(1)).save(any(HistoricoStatus.class));
    }

    @Test
    @DisplayName("Deve lançar exceção quando responsável não existe")
    void deveLancarExcecaoQuandoResponsavelNaoExiste() {
      // Given
      VinculoHierarquiaDTO vinculo = new VinculoHierarquiaDTO(1L, null, null, null);
      ObrigacaoCreateDTO dto =
          new ObrigacaoCreateDTO(
              "Nova Obrigação",
              "Descrição",
              LocalDate.now().plusDays(30),
              null,
              999L,
              List.of(vinculo));

      when(usuarioRepository.findById(999L)).thenReturn(Optional.empty());

      // When/Then
      assertThatThrownBy(() -> obrigacaoService.criar(dto))
          .isInstanceOf(EntityNotFoundException.class)
          .hasMessageContaining("Usuario")
          .hasMessageContaining("999");

      verify(obrigacaoRepository, never()).save(any(Obrigacao.class));
    }

    @Test
    @DisplayName("Deve lançar exceção quando responsável está inativo")
    void deveLancarExcecaoQuandoResponsavelInativo() {
      // Given
      responsavelAtivo.setAtivo(false);
      VinculoHierarquiaDTO vinculo = new VinculoHierarquiaDTO(1L, null, null, null);
      ObrigacaoCreateDTO dto =
          new ObrigacaoCreateDTO(
              "Nova Obrigação",
              "Descrição",
              LocalDate.now().plusDays(30),
              null,
              1L,
              List.of(vinculo));

      when(usuarioRepository.findById(1L)).thenReturn(Optional.of(responsavelAtivo));

      // When/Then
      assertThatThrownBy(() -> obrigacaoService.criar(dto))
          .isInstanceOf(BusinessValidationException.class)
          .hasMessageContaining("inativo");

      verify(obrigacaoRepository, never()).save(any(Obrigacao.class));
    }

    @Test
    @DisplayName("Deve lançar exceção quando prazo está no passado")
    void deveLancarExcecaoQuandoPrazoNoPassado() {
      // Given
      VinculoHierarquiaDTO vinculo = new VinculoHierarquiaDTO(1L, null, null, null);
      ObrigacaoCreateDTO dto =
          new ObrigacaoCreateDTO(
              "Nova Obrigação",
              "Descrição",
              LocalDate.now().minusDays(1),
              null,
              1L,
              List.of(vinculo));

      when(usuarioRepository.findById(1L)).thenReturn(Optional.of(responsavelAtivo));

      // When/Then
      assertThatThrownBy(() -> obrigacaoService.criar(dto))
          .isInstanceOf(BusinessValidationException.class)
          .hasMessageContaining("passado");

      verify(obrigacaoRepository, never()).save(any(Obrigacao.class));
    }

    @Test
    @DisplayName("Deve lançar exceção quando norma do vínculo não existe")
    void deveLancarExcecaoQuandoNormaVinculoNaoExiste() {
      // Given
      VinculoHierarquiaDTO vinculo = new VinculoHierarquiaDTO(999L, null, null, null);
      ObrigacaoCreateDTO dto =
          new ObrigacaoCreateDTO(
              "Nova Obrigação",
              "Descrição",
              LocalDate.now().plusDays(30),
              null,
              1L,
              List.of(vinculo));

      when(usuarioRepository.findById(1L)).thenReturn(Optional.of(responsavelAtivo));
      when(normaRepository.findById(999L)).thenReturn(Optional.empty());
      when(mapper.toEntity(dto)).thenReturn(obrigacao);

      // When/Then
      assertThatThrownBy(() -> obrigacaoService.criar(dto))
          .isInstanceOf(EntityNotFoundException.class)
          .hasMessageContaining("Norma")
          .hasMessageContaining("999");

      verify(obrigacaoRepository, never()).save(any(Obrigacao.class));
    }
  }

  @Nested
  @DisplayName("Atualizar Obrigação")
  class AtualizarObrigacaoTests {

    @Test
    @DisplayName("Deve atualizar obrigação quando dados válidos")
    void deveAtualizarObrigacaoQuandoDadosValidos() {
      // Given
      ObrigacaoUpdateDTO dto =
          new ObrigacaoUpdateDTO("Título Atualizado", "Nova descrição", LocalDate.now().plusDays(60), 1L);

      when(obrigacaoRepository.findById(1L)).thenReturn(Optional.of(obrigacao));
      when(obrigacaoRepository.save(obrigacao)).thenReturn(obrigacao);
      when(mapper.toResponseDTO(obrigacao)).thenReturn(new ObrigacaoResponseDTO(null, null, null, null, null, null, null, null, null, null, null, null, null, null));

      // When
      ObrigacaoResponseDTO result = obrigacaoService.atualizar(1L, dto);

      // Then
      assertThat(result).isNotNull();
      verify(obrigacaoRepository, times(1)).save(obrigacao);
    }

    @Test
    @DisplayName("Deve lançar exceção quando obrigação não existe")
    void deveLancarExcecaoQuandoObrigacaoNaoExiste() {
      // Given
      ObrigacaoUpdateDTO dto = new ObrigacaoUpdateDTO("Título", null, null, null);
      when(obrigacaoRepository.findById(999L)).thenReturn(Optional.empty());

      // When/Then
      assertThatThrownBy(() -> obrigacaoService.atualizar(999L, dto))
          .isInstanceOf(EntityNotFoundException.class)
          .hasMessageContaining("Obrigacao");
    }

    @Test
    @DisplayName("Deve lançar exceção quando obrigação está aprovada")
    void deveLancarExcecaoQuandoObrigacaoAprovada() {
      // Given
      obrigacao.setStatus(StatusObrigacao.APROVADA);
      ObrigacaoUpdateDTO dto = new ObrigacaoUpdateDTO("Título", null, null, null);

      when(obrigacaoRepository.findById(1L)).thenReturn(Optional.of(obrigacao));

      // When/Then
      assertThatThrownBy(() -> obrigacaoService.atualizar(1L, dto))
          .isInstanceOf(BusinessValidationException.class)
          .hasMessageContaining("aprovada");

      verify(obrigacaoRepository, never()).save(any(Obrigacao.class));
    }

    @Test
    @DisplayName("Deve lançar exceção quando obrigação está rejeitada")
    void deveLancarExcecaoQuandoObrigacaoRejeitada() {
      // Given
      obrigacao.setStatus(StatusObrigacao.REJEITADA);
      ObrigacaoUpdateDTO dto = new ObrigacaoUpdateDTO("Título", null, null, null);

      when(obrigacaoRepository.findById(1L)).thenReturn(Optional.of(obrigacao));

      // When/Then
      assertThatThrownBy(() -> obrigacaoService.atualizar(1L, dto))
          .isInstanceOf(BusinessValidationException.class)
          .hasMessageContaining("rejeitada");

      verify(obrigacaoRepository, never()).save(any(Obrigacao.class));
    }
  }

  @Nested
  @DisplayName("Submeter Obrigação")
  class SubmeterObrigacaoTests {

    @Test
    @DisplayName("Deve submeter obrigação quando dados válidos")
    void deveSubmeterObrigacaoQuandoDadosValidos() {
      // Given
      Evidencia evidencia = new Evidencia();
      obrigacao.getEvidencias().add(evidencia);

      when(obrigacaoRepository.findById(1L)).thenReturn(Optional.of(obrigacao));
      when(authentication.getName()).thenReturn("joao@example.com");
      when(obrigacaoRepository.save(obrigacao)).thenReturn(obrigacao);
      when(mapper.toResponseDTO(obrigacao)).thenReturn(new ObrigacaoResponseDTO(null, null, null, null, null, null, null, null, null, null, null, null, null, null));
      when(usuarioRepository.findByEmail("joao@example.com")).thenReturn(Optional.of(responsavelAtivo));

      // When
      ObrigacaoResponseDTO result = obrigacaoService.submeter(1L);

      // Then
      assertThat(result).isNotNull();
      verify(obrigacaoRepository, times(1)).save(obrigacao);
      verify(historicoRepository, times(1)).save(any(HistoricoStatus.class));
    }

    @Test
    @DisplayName("Deve lançar exceção quando usuário não é o responsável")
    void deveLancarExcecaoQuandoUsuarioNaoEhResponsavel() {
      // Given
      when(obrigacaoRepository.findById(1L)).thenReturn(Optional.of(obrigacao));
      when(authentication.getName()).thenReturn("outro@example.com");

      // When/Then
      assertThatThrownBy(() -> obrigacaoService.submeter(1L))
          .isInstanceOf(UnauthorizedException.class)
          .hasMessageContaining("responsável");

      verify(obrigacaoRepository, never()).save(any(Obrigacao.class));
    }

    @Test
    @DisplayName("Deve lançar exceção quando status não é PENDENTE")
    void deveLancarExcecaoQuandoStatusNaoPendente() {
      // Given
      obrigacao.setStatus(StatusObrigacao.SUBMETIDA);
      when(obrigacaoRepository.findById(1L)).thenReturn(Optional.of(obrigacao));
      when(authentication.getName()).thenReturn("joao@example.com");

      // When/Then
      assertThatThrownBy(() -> obrigacaoService.submeter(1L))
          .isInstanceOf(BusinessValidationException.class)
          .hasMessageContaining("pendentes");

      verify(obrigacaoRepository, never()).save(any(Obrigacao.class));
    }

    @Test
    @DisplayName("Deve lançar exceção quando não há evidências")
    void deveLancarExcecaoQuandoSemEvidencias() {
      // Given
      when(obrigacaoRepository.findById(1L)).thenReturn(Optional.of(obrigacao));
      when(authentication.getName()).thenReturn("joao@example.com");

      // When/Then
      assertThatThrownBy(() -> obrigacaoService.submeter(1L))
          .isInstanceOf(BusinessValidationException.class)
          .hasMessageContaining("evidência");

      verify(obrigacaoRepository, never()).save(any(Obrigacao.class));
    }
  }

  @Nested
  @DisplayName("Aprovar Obrigação")
  class AprovarObrigacaoTests {

    @Test
    @DisplayName("Deve aprovar obrigação quando dados válidos")
    void deveAprovarObrigacaoQuandoDadosValidos() {
      // Given
      obrigacao.setStatus(StatusObrigacao.SUBMETIDA);
      String motivo = "Evidências adequadas";

      when(obrigacaoRepository.findById(1L)).thenReturn(Optional.of(obrigacao));
      when(authentication.getName()).thenReturn("maria@example.com");
      when(usuarioRepository.findByEmail("maria@example.com")).thenReturn(Optional.of(compliance));
      when(obrigacaoRepository.save(obrigacao)).thenReturn(obrigacao);
      when(mapper.toResponseDTO(obrigacao)).thenReturn(new ObrigacaoResponseDTO(null, null, null, null, null, null, null, null, null, null, null, null, null, null));

      // When
      ObrigacaoResponseDTO result = obrigacaoService.aprovar(1L, motivo);

      // Then
      assertThat(result).isNotNull();
      verify(obrigacaoRepository, times(1)).save(obrigacao);
      verify(historicoRepository, times(1)).save(any(HistoricoStatus.class));
      assertThat(obrigacao.getStatus()).isEqualTo(StatusObrigacao.APROVADA);
    }

    @Test
    @DisplayName("Deve lançar exceção quando status não é SUBMETIDA")
    void deveLancarExcecaoQuandoStatusNaoSubmetida() {
      // Given
      obrigacao.setStatus(StatusObrigacao.PENDENTE);
      when(obrigacaoRepository.findById(1L)).thenReturn(Optional.of(obrigacao));

      // When/Then
      assertThatThrownBy(() -> obrigacaoService.aprovar(1L, "Motivo"))
          .isInstanceOf(BusinessValidationException.class)
          .hasMessageContaining("submetidas");

      verify(obrigacaoRepository, never()).save(any(Obrigacao.class));
    }
  }

  @Nested
  @DisplayName("Rejeitar Obrigação")
  class RejeitarObrigacaoTests {

    @Test
    @DisplayName("Deve rejeitar obrigação quando dados válidos")
    void deveRejeitarObrigacaoQuandoDadosValidos() {
      // Given
      obrigacao.setStatus(StatusObrigacao.SUBMETIDA);
      String motivo = "Evidências insuficientes";

      when(obrigacaoRepository.findById(1L)).thenReturn(Optional.of(obrigacao));
      when(authentication.getName()).thenReturn("maria@example.com");
      when(usuarioRepository.findByEmail("maria@example.com")).thenReturn(Optional.of(compliance));
      when(obrigacaoRepository.save(obrigacao)).thenReturn(obrigacao);
      when(mapper.toResponseDTO(obrigacao)).thenReturn(new ObrigacaoResponseDTO(null, null, null, null, null, null, null, null, null, null, null, null, null, null));

      // When
      ObrigacaoResponseDTO result = obrigacaoService.rejeitar(1L, motivo);

      // Then
      assertThat(result).isNotNull();
      verify(obrigacaoRepository, times(1)).save(obrigacao);
      verify(historicoRepository, times(1)).save(any(HistoricoStatus.class));
      assertThat(obrigacao.getStatus()).isEqualTo(StatusObrigacao.REJEITADA);
    }

    @Test
    @DisplayName("Deve lançar exceção quando motivo é nulo")
    void deveLancarExcecaoQuandoMotivoNulo() {
      // Given
      obrigacao.setStatus(StatusObrigacao.SUBMETIDA);
      when(obrigacaoRepository.findById(1L)).thenReturn(Optional.of(obrigacao));

      // When/Then
      assertThatThrownBy(() -> obrigacaoService.rejeitar(1L, null))
          .isInstanceOf(BusinessValidationException.class)
          .hasMessageContaining("obrigatório");

      verify(obrigacaoRepository, never()).save(any(Obrigacao.class));
    }

    @Test
    @DisplayName("Deve lançar exceção quando motivo está em branco")
    void deveLancarExcecaoQuandoMotivoEmBranco() {
      // Given
      obrigacao.setStatus(StatusObrigacao.SUBMETIDA);
      when(obrigacaoRepository.findById(1L)).thenReturn(Optional.of(obrigacao));

      // When/Then
      assertThatThrownBy(() -> obrigacaoService.rejeitar(1L, "  "))
          .isInstanceOf(BusinessValidationException.class)
          .hasMessageContaining("obrigatório");

      verify(obrigacaoRepository, never()).save(any(Obrigacao.class));
    }
  }

  @Nested
  @DisplayName("Buscar por ID")
  class BuscarPorIdTests {

    @Test
    @DisplayName("Deve buscar obrigação quando usuário COMPLIANCE")
    void deveBuscarObrigacaoQuandoUsuarioCompliance() {
      // Given
      when(obrigacaoRepository.findById(1L)).thenReturn(Optional.of(obrigacao));
      when(authentication.getName()).thenReturn("maria@example.com");
      when(usuarioRepository.findByEmail("maria@example.com")).thenReturn(Optional.of(compliance));
      when(mapper.toResponseDTO(obrigacao)).thenReturn(new ObrigacaoResponseDTO(null, null, null, null, null, null, null, null, null, null, null, null, null, null));

      // When
      ObrigacaoResponseDTO result = obrigacaoService.buscarPorId(1L);

      // Then
      assertThat(result).isNotNull();
      verify(obrigacaoRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Deve buscar obrigação quando usuário é o responsável")
    void deveBuscarObrigacaoQuandoUsuarioResponsavel() {
      // Given
      when(obrigacaoRepository.findById(1L)).thenReturn(Optional.of(obrigacao));
      when(authentication.getName()).thenReturn("joao@example.com");
      when(usuarioRepository.findByEmail("joao@example.com")).thenReturn(Optional.of(responsavelAtivo));
      when(mapper.toResponseDTO(obrigacao)).thenReturn(new ObrigacaoResponseDTO(null, null, null, null, null, null, null, null, null, null, null, null, null, null));

      // When
      ObrigacaoResponseDTO result = obrigacaoService.buscarPorId(1L);

      // Then
      assertThat(result).isNotNull();
      verify(obrigacaoRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Deve lançar exceção quando RESPONSAVEL tenta ver obrigação de outro")
    void deveLancarExcecaoQuandoResponsavelTentaVerOutraObrigacao() {
      // Given
      when(obrigacaoRepository.findById(1L)).thenReturn(Optional.of(obrigacao));
      when(authentication.getName()).thenReturn("outro@example.com");

      Usuario outroResponsavel = new Usuario();
      outroResponsavel.setEmail("outro@example.com");
      outroResponsavel.setPerfil(PerfilUsuario.ROLE_RESPONSAVEL);

      when(usuarioRepository.findByEmail("outro@example.com"))
          .thenReturn(Optional.of(outroResponsavel));

      // When/Then
      assertThatThrownBy(() -> obrigacaoService.buscarPorId(1L))
          .isInstanceOf(UnauthorizedException.class)
          .hasMessageContaining("permissão");
    }

    @Test
    @DisplayName("Deve lançar exceção quando obrigação não existe")
    void deveLancarExcecaoQuandoObrigacaoNaoExiste() {
      // Given
      when(obrigacaoRepository.findById(999L)).thenReturn(Optional.empty());

      // When/Then
      assertThatThrownBy(() -> obrigacaoService.buscarPorId(999L))
          .isInstanceOf(EntityNotFoundException.class)
          .hasMessageContaining("Obrigacao");
    }
  }

  @Nested
  @DisplayName("Listar Obrigações")
  class ListarObrigacoesTests {

    @Test
    @DisplayName("Deve listar todas obrigações quando usuário COMPLIANCE")
    void deveListarTodasObrigacoesQuandoUsuarioCompliance() {
      // Given
      Pageable pageable = PageRequest.of(0, 10);
      Page<Obrigacao> page = new PageImpl<>(List.of(obrigacao));

      when(authentication.getName()).thenReturn("maria@example.com");
      when(usuarioRepository.findByEmail("maria@example.com")).thenReturn(Optional.of(compliance));
      when(obrigacaoRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);
      when(mapper.toResponseDTO(any(Obrigacao.class))).thenReturn(new ObrigacaoResponseDTO(null, null, null, null, null, null, null, null, null, null, null, null, null, null));

      // When
      Page<ObrigacaoResponseDTO> result =
          obrigacaoService.listar(null, null, null, pageable);

      // Then
      assertThat(result).isNotNull();
      assertThat(result.getContent()).hasSize(1);
      verify(obrigacaoRepository, times(1)).findAll(any(Specification.class), eq(pageable));
    }

    @Test
    @DisplayName("Deve filtrar por responsável quando usuário é RESPONSAVEL")
    void deveFiltrarPorResponsavelQuandoUsuarioResponsavel() {
      // Given
      Pageable pageable = PageRequest.of(0, 10);
      Page<Obrigacao> page = new PageImpl<>(List.of(obrigacao));

      when(authentication.getName()).thenReturn("joao@example.com");
      when(usuarioRepository.findByEmail("joao@example.com")).thenReturn(Optional.of(responsavelAtivo));
      when(obrigacaoRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);
      when(mapper.toResponseDTO(any(Obrigacao.class))).thenReturn(new ObrigacaoResponseDTO(null, null, null, null, null, null, null, null, null, null, null, null, null, null));

      // When
      Page<ObrigacaoResponseDTO> result =
          obrigacaoService.listar(null, null, null, pageable);

      // Then
      assertThat(result).isNotNull();
      assertThat(result.getContent()).hasSize(1);
      verify(obrigacaoRepository, times(1)).findAll(any(Specification.class), eq(pageable));
    }
  }

  @Nested
  @DisplayName("Excluir Obrigação")
  class ExcluirObrigacaoTests {

    @Test
    @DisplayName("Deve fazer soft delete da obrigação")
    void deveFazerSoftDeleteDaObrigacao() {
      // Given
      when(obrigacaoRepository.findById(1L)).thenReturn(Optional.of(obrigacao));
      when(obrigacaoRepository.save(obrigacao)).thenReturn(obrigacao);

      // When
      obrigacaoService.excluir(1L);

      // Then
      verify(obrigacaoRepository, times(1)).save(obrigacao);
      assertThat(obrigacao.getAtivo()).isFalse();
    }

    @Test
    @DisplayName("Deve lançar exceção quando obrigação não existe")
    void deveLancarExcecaoQuandoObrigacaoNaoExiste() {
      // Given
      when(obrigacaoRepository.findById(999L)).thenReturn(Optional.empty());

      // When/Then
      assertThatThrownBy(() -> obrigacaoService.excluir(999L))
          .isInstanceOf(EntityNotFoundException.class)
          .hasMessageContaining("Obrigacao");

      verify(obrigacaoRepository, never()).save(any(Obrigacao.class));
    }
  }

  @Nested
  @DisplayName("Buscar Atrasadas")
  class BuscarAtrasadasTests {

    @Test
    @DisplayName("Deve retornar lista de obrigações atrasadas")
    void deveRetornarListaDeObrigacoesAtrasadas() {
      // Given
      List<Obrigacao> atrasadas = List.of(obrigacao);
      when(obrigacaoRepository.findObrigacoesAtrasadas(any(LocalDate.class)))
          .thenReturn(atrasadas);
      when(mapper.toResponseDTO(any(Obrigacao.class))).thenReturn(new ObrigacaoResponseDTO(null, null, null, null, null, null, null, null, null, null, null, null, null, null));

      // When
      List<ObrigacaoResponseDTO> result = obrigacaoService.buscarAtrasadas();

      // Then
      assertThat(result).isNotNull();
      assertThat(result).hasSize(1);
      verify(obrigacaoRepository, times(1)).findObrigacoesAtrasadas(any(LocalDate.class));
    }
  }
}
