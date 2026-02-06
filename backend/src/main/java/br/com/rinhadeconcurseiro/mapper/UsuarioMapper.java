package br.com.rinhadeconcurseiro.mapper;

import br.com.rinhadeconcurseiro.dto.response.UsuarioResponse;
import br.com.rinhadeconcurseiro.entity.Usuario;
import org.springframework.stereotype.Component;

@Component
public class UsuarioMapper {

    public UsuarioResponse toResponse(Usuario usuario){

        if(usuario == null) {
            return null;
        }

        return UsuarioResponse.builder()
                .id(usuario.getId())
                .nome(usuario.getNome())
                .email(usuario.getEmail())
                .apelido(usuario.getApelido())
                .fotoUrl(usuario.getFotoUrl())
                .createdAt(usuario.getCreatedAt())
                .ultimoAcesso(usuario.getUltimoAcesso())
                .build();
    }
}
