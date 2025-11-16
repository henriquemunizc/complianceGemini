package com.compliance.sgc.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.compliance.sgc.domain.entity.Norma;
import com.compliance.sgc.dto.norma.NormaCreateDTO;
import com.compliance.sgc.dto.norma.NormaResponseDTO;
import com.compliance.sgc.dto.norma.NormaUpdateDTO;
import com.compliance.sgc.exception.BusinessValidationException;
import com.compliance.sgc.exception.EntityNotFoundException;
import com.compliance.sgc.mapper.NormaMapper;
import com.compliance.sgc.repository.NormaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

@ExtendWith(MockitoExtension.class)
@DisplayName("NormaService - Testes Unitários")
class NormaServiceTest {

  @Mock private NormaRepository normaRepository;
  @Mock private NormaMapper mapper;

  @InjectMocks private NormaService normaService;

  private Norma norma;
  private NormaResponseDTO normaResponseDTO;

  @BeforeEach
  void setUp() {
    // Setup norma
    norma = new Norma();
    norma.setNormaId(1L);
    norma.setTitulo("Lei Federal 12.345/2023");
    norma.setNumero("12.345");
    norma.setAno(2023);
    norma.setDataPublicacao(LocalDate.of(2023, 6, 15));
    norma.setDataRevogacao(null);
    norma.setAtivo(true);

    // Setup response DTO
    normaResponseDTO =
        new NormaResponseDTO(
            1L,
            "Lei Federal 12.345/2023",
            "12.345",
            2023,
            "LEI",
            "Governo Federal",
            LocalDate.of(2023, 6, 15),
            null,
            "Ementa da lei",
            "https://example.com/lei",
            true,
            null,
            null);
  }

  @Nested
  @DisplayName("Criar Norma")
  class CriarNormaTests {

    @Test
    @DisplayName("Deve criar norma quando dados válidos")
    void deveCriarNormaQuandoDadosValidos() {
      // Given
      NormaCreateDTO dto =
          new NormaCreateDTO(
              "Lei Federal 12.345/2023",
              "12.345",
              2023,
              "LEI",
              "Governo Federal",
              LocalDate.of(2023, 6, 15),
              null,
              "Ementa da lei",
              "https://example.com/lei");

      when(normaRepository.existsByTipoAndNumeroAndAno("LEI", "12.345", 2023)).thenReturn(false);
      when(mapper.toEntity(dto)).thenReturn(norma);
      when(normaRepository.save(norma)).thenReturn(norma);
      when(mapper.toResponseDTO(norma)).thenReturn(normaResponseDTO);

      // When
      NormaResponseDTO result = normaService.criar(dto);

      // Then
      assertThat(result).isNotNull();
      assertThat(result.normaId()).isEqualTo(1L);
      verify(normaRepository, times(1)).save(norma);
      verify(normaRepository, times(1)).existsByTipoAndNumeroAndAno("LEI", "12.345", 2023);
    }

    @Test
    @DisplayName("Deve lançar exceção quando norma duplicada")
    void deveLancarExcecaoQuandoNormaDuplicada() {
      // Given
      NormaCreateDTO dto =
          new NormaCreateDTO(
              "Lei Federal 12.345/2023",
              "12.345",
              2023,
              "LEI",
              "Governo Federal",
              LocalDate.of(2023, 6, 15),
              null,
              "Ementa",
              null);

      when(normaRepository.existsByTipoAndNumeroAndAno("LEI", "12.345", 2023)).thenReturn(true);

      // When/Then
      assertThatThrownBy(() -> normaService.criar(dto))
          .isInstanceOf(BusinessValidationException.class)
          .hasMessageContaining("Já existe")
          .hasMessageContaining("12.345")
          .hasMessageContaining("2023");

      verify(normaRepository, never()).save(any(Norma.class));
    }

    @Test
    @DisplayName("Deve lançar exceção quando data de publicação é futura")
    void deveLancarExcecaoQuandoDataPublicacaoFutura() {
      // Given
      LocalDate dataFutura = LocalDate.now().plusDays(10);
      NormaCreateDTO dto =
          new NormaCreateDTO(
              "Lei Federal 12.345/2023",
              "12.345",
              2023,
              "LEI",
              "Governo Federal",
              dataFutura,
              null,
              "Ementa",
              null);

      when(normaRepository.existsByTipoAndNumeroAndAno("LEI", "12.345", 2023)).thenReturn(false);

      // When/Then
      assertThatThrownBy(() -> normaService.criar(dto))
          .isInstanceOf(BusinessValidationException.class)
          .hasMessageContaining("futura");

      verify(normaRepository, never()).save(any(Norma.class));
    }

    @Test
    @DisplayName("Deve lançar exceção quando data de revogação é anterior à publicação")
    void deveLancarExcecaoQuandoDataRevogacaoAnterior() {
      // Given
      LocalDate publicacao = LocalDate.of(2023, 6, 15);
      LocalDate revogacao = LocalDate.of(2023, 5, 1);

      NormaCreateDTO dto =
          new NormaCreateDTO(
              "Lei Federal 12.345/2023",
              "12.345",
              2023,
              "LEI",
              "Governo Federal",
              publicacao,
              revogacao,
              "Ementa",
              null);

      when(normaRepository.existsByTipoAndNumeroAndAno("LEI", "12.345", 2023)).thenReturn(false);

      // When/Then
      assertThatThrownBy(() -> normaService.criar(dto))
          .isInstanceOf(BusinessValidationException.class)
          .hasMessageContaining("posterior");

      verify(normaRepository, never()).save(any(Norma.class));
    }

    @Test
    @DisplayName("Deve criar norma com data de revogação válida")
    void deveCriarNormaComDataRevogacaoValida() {
      // Given
      LocalDate publicacao = LocalDate.of(2023, 6, 15);
      LocalDate revogacao = LocalDate.of(2023, 12, 31);

      NormaCreateDTO dto =
          new NormaCreateDTO(
              "Lei Federal 12.345/2023",
              "12.345",
              2023,
              "LEI",
              "Governo Federal",
              publicacao,
              revogacao,
              "Ementa",
              null);

      norma.setDataRevogacao(revogacao);

      when(normaRepository.existsByTipoAndNumeroAndAno("LEI", "12.345", 2023)).thenReturn(false);
      when(mapper.toEntity(dto)).thenReturn(norma);
      when(normaRepository.save(norma)).thenReturn(norma);
      when(mapper.toResponseDTO(norma)).thenReturn(normaResponseDTO);

      // When
      NormaResponseDTO result = normaService.criar(dto);

      // Then
      assertThat(result).isNotNull();
      verify(normaRepository, times(1)).save(norma);
    }
  }

  @Nested
  @DisplayName("Atualizar Norma")
  class AtualizarNormaTests {

    @Test
    @DisplayName("Deve atualizar norma quando dados válidos")
    void deveAtualizarNormaQuandoDadosValidos() {
      // Given
      NormaUpdateDTO dto =
          new NormaUpdateDTO(
              "Lei Federal 12.345/2023 - Atualizada",
              null,
              null,
              null,
              null,
              null,
              null,
              "Ementa atualizada",
              null);

      when(normaRepository.findById(1L)).thenReturn(Optional.of(norma));
      when(normaRepository.save(norma)).thenReturn(norma);
      when(mapper.toResponseDTO(norma)).thenReturn(normaResponseDTO);

      // When
      NormaResponseDTO result = normaService.atualizar(1L, dto);

      // Then
      assertThat(result).isNotNull();
      verify(normaRepository, times(1)).save(norma);
      verify(mapper, times(1)).updateEntityFromDTO(dto, norma);
    }

    @Test
    @DisplayName("Deve lançar exceção quando norma não existe")
    void deveLancarExcecaoQuandoNormaNaoExiste() {
      // Given
      NormaUpdateDTO dto = new NormaUpdateDTO("Título", null, null, null, null, null, null, null, null);
      when(normaRepository.findById(999L)).thenReturn(Optional.empty());

      // When/Then
      assertThatThrownBy(() -> normaService.atualizar(999L, dto))
          .isInstanceOf(EntityNotFoundException.class)
          .hasMessageContaining("Norma")
          .hasMessageContaining("999");

      verify(normaRepository, never()).save(any(Norma.class));
    }

    @Test
    @DisplayName("Deve lançar exceção quando atualizar com data de publicação futura")
    void deveLancarExcecaoQuandoAtualizarComDataPublicacaoFutura() {
      // Given
      LocalDate dataFutura = LocalDate.now().plusDays(10);
      NormaUpdateDTO dto = new NormaUpdateDTO(null, null, null, null, null, dataFutura, null, null, null);

      norma.setDataPublicacao(dataFutura);

      when(normaRepository.findById(1L)).thenReturn(Optional.of(norma));

      // When/Then
      assertThatThrownBy(() -> normaService.atualizar(1L, dto))
          .isInstanceOf(BusinessValidationException.class)
          .hasMessageContaining("futura");

      verify(normaRepository, never()).save(any(Norma.class));
    }

    @Test
    @DisplayName("Deve lançar exceção quando atualizar com data de revogação anterior à publicação")
    void deveLancarExcecaoQuandoAtualizarComDataRevogacaoAnterior() {
      // Given
      LocalDate revogacao = LocalDate.of(2023, 5, 1);
      NormaUpdateDTO dto = new NormaUpdateDTO(null, null, null, null, null, null, revogacao, null, null);

      norma.setDataPublicacao(LocalDate.of(2023, 6, 15));
      norma.setDataRevogacao(revogacao);

      when(normaRepository.findById(1L)).thenReturn(Optional.of(norma));

      // When/Then
      assertThatThrownBy(() -> normaService.atualizar(1L, dto))
          .isInstanceOf(BusinessValidationException.class)
          .hasMessageContaining("posterior");

      verify(normaRepository, never()).save(any(Norma.class));
    }
  }

  @Nested
  @DisplayName("Buscar por ID")
  class BuscarPorIdTests {

    @Test
    @DisplayName("Deve buscar norma por ID quando existe")
    void deveBuscarNormaPorIdQuandoExiste() {
      // Given
      when(normaRepository.findById(1L)).thenReturn(Optional.of(norma));
      when(mapper.toResponseDTO(norma)).thenReturn(normaResponseDTO);

      // When
      NormaResponseDTO result = normaService.buscarPorId(1L);

      // Then
      assertThat(result).isNotNull();
      assertThat(result.normaId()).isEqualTo(1L);
      verify(normaRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Deve lançar exceção quando norma não existe")
    void deveLancarExcecaoQuandoNormaNaoExiste() {
      // Given
      when(normaRepository.findById(999L)).thenReturn(Optional.empty());

      // When/Then
      assertThatThrownBy(() -> normaService.buscarPorId(999L))
          .isInstanceOf(EntityNotFoundException.class)
          .hasMessageContaining("Norma")
          .hasMessageContaining("999");
    }
  }

  @Nested
  @DisplayName("Listar Normas")
  class ListarNormasTests {

    @Test
    @DisplayName("Deve listar todas as normas ativas sem filtros")
    void deveListarTodasNormasAtivasSemFiltros() {
      // Given
      Pageable pageable = PageRequest.of(0, 10);
      Page<Norma> page = new PageImpl<>(List.of(norma));

      when(normaRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);
      when(mapper.toResponseDTO(any(Norma.class))).thenReturn(normaResponseDTO);

      // When
      Page<NormaResponseDTO> result = normaService.listar(null, null, null, pageable);

      // Then
      assertThat(result).isNotNull();
      assertThat(result.getContent()).hasSize(1);
      verify(normaRepository, times(1)).findAll(any(Specification.class), eq(pageable));
    }

    @Test
    @DisplayName("Deve filtrar normas por tipo")
    void deveFiltrarNormasPorTipo() {
      // Given
      Pageable pageable = PageRequest.of(0, 10);
      Page<Norma> page = new PageImpl<>(List.of(norma));

      when(normaRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);
      when(mapper.toResponseDTO(any(Norma.class))).thenReturn(normaResponseDTO);

      // When
      Page<NormaResponseDTO> result = normaService.listar("LEI", null, null, pageable);

      // Then
      assertThat(result).isNotNull();
      assertThat(result.getContent()).hasSize(1);
      verify(normaRepository, times(1)).findAll(any(Specification.class), eq(pageable));
    }

    @Test
    @DisplayName("Deve filtrar normas por ano")
    void deveFiltrarNormasPorAno() {
      // Given
      Pageable pageable = PageRequest.of(0, 10);
      Page<Norma> page = new PageImpl<>(List.of(norma));

      when(normaRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);
      when(mapper.toResponseDTO(any(Norma.class))).thenReturn(normaResponseDTO);

      // When
      Page<NormaResponseDTO> result = normaService.listar(null, 2023, null, pageable);

      // Then
      assertThat(result).isNotNull();
      assertThat(result.getContent()).hasSize(1);
      verify(normaRepository, times(1)).findAll(any(Specification.class), eq(pageable));
    }

    @Test
    @DisplayName("Deve filtrar normas vigentes")
    void deveFiltrarNormasVigentes() {
      // Given
      Pageable pageable = PageRequest.of(0, 10);
      Page<Norma> page = new PageImpl<>(List.of(norma));

      when(normaRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);
      when(mapper.toResponseDTO(any(Norma.class))).thenReturn(normaResponseDTO);

      // When
      Page<NormaResponseDTO> result = normaService.listar(null, null, true, pageable);

      // Then
      assertThat(result).isNotNull();
      assertThat(result.getContent()).hasSize(1);
      verify(normaRepository, times(1)).findAll(any(Specification.class), eq(pageable));
    }

    @Test
    @DisplayName("Deve filtrar com múltiplos critérios")
    void deveFiltrarComMultiplosCriterios() {
      // Given
      Pageable pageable = PageRequest.of(0, 10);
      Page<Norma> page = new PageImpl<>(List.of(norma));

      when(normaRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);
      when(mapper.toResponseDTO(any(Norma.class))).thenReturn(normaResponseDTO);

      // When
      Page<NormaResponseDTO> result = normaService.listar("LEI", 2023, true, pageable);

      // Then
      assertThat(result).isNotNull();
      assertThat(result.getContent()).hasSize(1);
      verify(normaRepository, times(1)).findAll(any(Specification.class), eq(pageable));
    }
  }

  @Nested
  @DisplayName("Excluir Norma")
  class ExcluirNormaTests {

    @Test
    @DisplayName("Deve fazer soft delete da norma")
    void deveFazerSoftDeleteDaNorma() {
      // Given
      when(normaRepository.findById(1L)).thenReturn(Optional.of(norma));
      when(normaRepository.save(norma)).thenReturn(norma);

      // When
      normaService.excluir(1L);

      // Then
      verify(normaRepository, times(1)).save(norma);
      assertThat(norma.getAtivo()).isFalse();
    }

    @Test
    @DisplayName("Deve lançar exceção quando norma não existe")
    void deveLancarExcecaoQuandoNormaNaoExiste() {
      // Given
      when(normaRepository.findById(999L)).thenReturn(Optional.empty());

      // When/Then
      assertThatThrownBy(() -> normaService.excluir(999L))
          .isInstanceOf(EntityNotFoundException.class)
          .hasMessageContaining("Norma")
          .hasMessageContaining("999");

      verify(normaRepository, never()).save(any(Norma.class));
    }
  }

  @Nested
  @DisplayName("Buscar Normas Vigentes")
  class BuscarNormasVigentesTests {

    @Test
    @DisplayName("Deve retornar lista de normas vigentes")
    void deveRetornarListaDeNormasVigentes() {
      // Given
      List<Norma> vigentes = List.of(norma);
      when(normaRepository.findNormasVigentes(any(LocalDate.class))).thenReturn(vigentes);
      when(mapper.toResponseDTO(any(Norma.class))).thenReturn(normaResponseDTO);

      // When
      List<NormaResponseDTO> result = normaService.buscarNormasVigentes();

      // Then
      assertThat(result).isNotNull();
      assertThat(result).hasSize(1);
      verify(normaRepository, times(1)).findNormasVigentes(any(LocalDate.class));
    }

    @Test
    @DisplayName("Deve retornar lista vazia quando não há normas vigentes")
    void deveRetornarListaVaziaQuandoNaoHaNormasVigentes() {
      // Given
      when(normaRepository.findNormasVigentes(any(LocalDate.class))).thenReturn(List.of());

      // When
      List<NormaResponseDTO> result = normaService.buscarNormasVigentes();

      // Then
      assertThat(result).isNotNull();
      assertThat(result).isEmpty();
      verify(normaRepository, times(1)).findNormasVigentes(any(LocalDate.class));
    }
  }
}
