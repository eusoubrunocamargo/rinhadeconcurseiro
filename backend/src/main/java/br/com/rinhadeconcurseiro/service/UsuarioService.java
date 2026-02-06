package br.com.rinhadeconcurseiro.service;

import br.com.rinhadeconcurseiro.dto.request.UsuarioUpdateRequest;
import br.com.rinhadeconcurseiro.dto.response.UsuarioResponse;
import br.com.rinhadeconcurseiro.entity.Usuario;
import br.com.rinhadeconcurseiro.exception.ApelidoExistenteException;
import br.com.rinhadeconcurseiro.exception.ResourceNotFoundException;
import br.com.rinhadeconcurseiro.mapper.UsuarioMapper;
import br.com.rinhadeconcurseiro.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;

    @Transactional(readOnly = true)
    public UsuarioResponse buscarPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(()-> new ResourceNotFoundException("Usuário não encontrado"));
        return usuarioMapper.toResponse(usuario);
    }

    @Transactional(readOnly = true)
    public UsuarioResponse buscarPorGoogleId(String googleId) {
        Usuario usuario = usuarioRepository.findByGoogleId(googleId)
                .orElseThrow(()-> new ResourceNotFoundException("Usuário não encontrado"));
        return usuarioMapper.toResponse(usuario);
    }

    @Transactional
    public UsuarioResponse atualizarApelido(Long id, UsuarioUpdateRequest request){
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(()-> new ResourceNotFoundException("Usuário não encontrado"));

        String novoApelido = request.apelido();

        if(novoApelido != null && !novoApelido.isBlank()){
            if(usuarioRepository.existsByApelido(novoApelido) &&
            !novoApelido.equals(usuario.getApelido())){
                throw new ApelidoExistenteException(novoApelido);
            }
            usuario.setApelido(novoApelido);
        }

        Usuario salvo = usuarioRepository.save(usuario);
        return usuarioMapper.toResponse(salvo);
    }

    @Transactional
    public void atualizarUltimoAcesso(Long id){
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(()-> new ResourceNotFoundException("Usuário não encontrado"));
        usuario.setUltimoAcesso(LocalDateTime.now());
        usuarioRepository.save(usuario);
    }


}
