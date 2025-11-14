package com.compliance.sgc.config;

import com.compliance.sgc.security.JwtAuthenticationEntryPoint;
import com.compliance.sgc.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

/**
 * Configuração de Segurança do Spring Security 6.
 * Define autenticação stateless com JWT, autorização por roles e proteção OWASP.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-14
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

  @Autowired
  private JwtAuthenticationFilter jwtAuthenticationFilter;

  @Autowired
  private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

  @Autowired
  private UserDetailsService userDetailsService;

  /**
   * Configura o PasswordEncoder (BCrypt).
   *
   * @return PasswordEncoder para hash de senhas
   */
  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  /**
   * Configura o AuthenticationProvider.
   *
   * @return DaoAuthenticationProvider configurado
   */
  @Bean
  public DaoAuthenticationProvider authenticationProvider() {
    DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
    authProvider.setUserDetailsService(userDetailsService);
    authProvider.setPasswordEncoder(passwordEncoder());
    return authProvider;
  }

  /**
   * Configura o AuthenticationManager.
   *
   * @param authConfig Configuração de autenticação
   * @return AuthenticationManager
   * @throws Exception se houver erro na configuração
   */
  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig)
      throws Exception {
    return authConfig.getAuthenticationManager();
  }

  /**
   * Configura o SecurityFilterChain.
   * Define regras de autenticação, autorização e proteções de segurança.
   *
   * @param http HttpSecurity
   * @return SecurityFilterChain configurado
   * @throws Exception se houver erro na configuração
   */
  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        // Desabilita CSRF (stateless API com JWT)
        .csrf(AbstractHttpConfigurer::disable)

        // Configura CORS
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))

        // Configura política de sessão stateless
        .sessionManagement(session -> session
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

        // Configura tratamento de exceções de autenticação
        .exceptionHandling(exception -> exception
            .authenticationEntryPoint(jwtAuthenticationEntryPoint))

        // Configura headers de segurança (proteção OWASP)
        .headers(headers -> headers
            .frameOptions(frameOptions -> frameOptions.deny()) // X-Frame-Options: DENY
            .contentTypeOptions(contentType -> contentType.disable()) // X-Content-Type-Options
            .xssProtection(xss -> xss.disable()) // X-XSS-Protection (deprecated)
            .httpStrictTransportSecurity(hsts -> hsts
                .includeSubDomains(true)
                .maxAgeInSeconds(31536000)) // HSTS
        )

        // Configura regras de autorização
        .authorizeHttpRequests(auth -> auth
            // Endpoints públicos (autenticação)
            .requestMatchers("/api/v1/auth/**").permitAll()

            // Documentação da API (Swagger/OpenAPI)
            .requestMatchers("/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()

            // Actuator (health checks)
            .requestMatchers("/actuator/health").permitAll()

            // OPTIONS pre-flight requests (CORS)
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

            // Todos os outros endpoints requerem autenticação
            .anyRequest().authenticated()
        )

        // Adiciona o filtro JWT antes do UsernamePasswordAuthenticationFilter
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

        // Configura o AuthenticationProvider
        .authenticationProvider(authenticationProvider());

    return http.build();
  }

  /**
   * Configura CORS (Cross-Origin Resource Sharing).
   * Proteção OWASP: Cross-Site Scripting (XSS).
   *
   * @return CorsConfigurationSource configurado
   */
  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200")); // Angular dev
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setExposedHeaders(Arrays.asList("Authorization"));
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", configuration);
    return source;
  }
}
