package br.com.rinhadeconcurseiro.mapper;

import br.com.rinhadeconcurseiro.dto.response.ConviteResponse;
import br.com.rinhadeconcurseiro.dto.response.DueloResponse;
import br.com.rinhadeconcurseiro.entity.ConviteDuelo;
import br.com.rinhadeconcurseiro.entity.Duelo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

// DueloMapper.java
@Component
@RequiredArgsConstructor
public class DueloMapper {

    // Injetamos o mapper existente para reutilizar a conversão de Usuario.
    // O DueloMapper não precisa saber como montar um UsuarioResponse —
    // ele delega essa responsabilidade a quem já sabe fazer isso.
    private final UsuarioMapper usuarioMapper;

    public ConviteResponse toConviteResponse(ConviteDuelo convite) {
        return ConviteResponse.builder()
                .id(convite.getId())
                // Convertemos UUID para String aqui no mapper, mantendo o DTO
                // desacoplado do tipo UUID do Java
                .token(convite.getToken().toString())
                .remetente(usuarioMapper.toResponse(convite.getRemetente()))
                .status(convite.getStatus())
                .expiresAt(convite.getExpiresAt())
                .createdAt(convite.getCreatedAt())
                .build();
    }

    public DueloResponse toDueloResponse(Duelo duelo) {
        return DueloResponse.builder()
                .id(duelo.getId())
                .status(duelo.getStatus())
                .host(usuarioMapper.toResponse(duelo.getHost()))
                .desafiado(usuarioMapper.toResponse(duelo.getDesafiado()))
                .pontosHost(duelo.getPontosHost())
                .pontosDesafiado(duelo.getPontosDesafiado())
                // vencedor pode ser null (empate ou duelo ainda em andamento)
                .vencedor(duelo.getVencedor() != null
                        ? usuarioMapper.toResponse(duelo.getVencedor())
                        : null)
                .createdAt(duelo.getCreatedAt())
                .finalizadoEm(duelo.getFinalizadoEm())
                .build();
    }
}
