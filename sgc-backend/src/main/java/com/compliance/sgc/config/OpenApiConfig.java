package com.compliance.sgc.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.servers.Server;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuração do SpringDoc OpenAPI 3 para documentação automática da API.
 *
 * <p>Configura:
 * <ul>
 *   <li>Informações da API (título, versão, descrição, contato)</li>
 *   <li>Security Scheme JWT (Bearer Authentication)</li>
 *   <li>Requirement global para autenticação JWT</li>
 *   <li>Servidor(es) disponível(is)</li>
 * </ul>
 *
 * <p>Documentação disponível em:
 * <ul>
 *   <li>Swagger UI: http://localhost:8080/swagger-ui.html</li>
 *   <li>OpenAPI JSON: http://localhost:8080/v3/api-docs</li>
 * </ul>
 *
 * @author Equipe SGC
 * @version 1.0.0
 * @since 2025-11-16
 */
@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "SGC - Sistema de Gestão de Compliance API",
        version = "1.0.0",
        description = "API REST para gerenciamento de obrigações de compliance regulatório",
        contact = @Contact(
            name = "Equipe SGC"
        )
    ),
    security = @SecurityRequirement(name = "bearerAuth")
)
@SecurityScheme(
    name = "bearerAuth",
    description = "Autenticação JWT usando Bearer token. Obtenha o token através do endpoint /api/v1/auth/login",
    scheme = "bearer",
    type = SecuritySchemeType.HTTP,
    bearerFormat = "JWT",
    in = SecuritySchemeIn.HEADER
)
public class OpenApiConfig {

  @Value("${server.port:8080}")
  private String serverPort;

  /**
   * Configura o bean OpenAPI com informações adicionais do servidor.
   *
   * @return OpenAPI configurado
   */
  @Bean
  public OpenAPI customOpenAPI() {
    Server localServer = new Server();
    localServer.setUrl("http://localhost:" + serverPort);
    localServer.setDescription("Servidor de Desenvolvimento Local");

    return new io.swagger.v3.oas.models.OpenAPI()
        .servers(List.of(localServer));
  }
}
