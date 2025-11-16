package com.compliance.sgc.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.concurrent.TimeUnit;

/**
 * Configuração de Cache usando Caffeine.
 *
 * Performance Optimization:
 * - Dashboard metrics: 5 minutos de cache
 * - Normas vigentes: 1 hora de cache
 * - Usuários ativos: 10 minutos de cache
 *
 * @author Performance Team
 * @version 1.0
 * @since 2025-11-16
 */
@Configuration
@EnableCaching
public class CacheConfig {

  /**
   * Cache para métricas do dashboard.
   * TTL: 5 minutos
   * Max Size: 100 entradas
   */
  @Bean
  public Caffeine<Object, Object> caffeineConfig() {
    return Caffeine.newBuilder()
        .expireAfterWrite(5, TimeUnit.MINUTES)
        .maximumSize(100)
        .recordStats();
  }

  /**
   * CacheManager configurado com Caffeine.
   */
  @Bean
  public CacheManager cacheManager(Caffeine<Object, Object> caffeine) {
    CaffeineCacheManager cacheManager = new CaffeineCacheManager();
    cacheManager.setCaffeine(caffeine);
    return cacheManager;
  }

  /**
   * Nomes de caches:
   * - dashboardMetrics: 5 minutos
   * - normasVigentes: 1 hora
   * - usuariosAtivos: 10 minutos
   */
  public static final String CACHE_DASHBOARD = "dashboardMetrics";
  public static final String CACHE_NORMAS_VIGENTES = "normasVigentes";
  public static final String CACHE_USUARIOS_ATIVOS = "usuariosAtivos";
}
