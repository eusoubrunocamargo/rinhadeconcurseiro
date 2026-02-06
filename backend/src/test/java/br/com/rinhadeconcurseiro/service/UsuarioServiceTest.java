package br.com.rinhadeconcurseiro.service;

import br.com.rinhadeconcurseiro.dto.request.UsuarioUpdateRequest;
import br.com.rinhadeconcurseiro.dto.response.UsuarioResponse;
import br.com.rinhadeconcurseiro.entity.Usuario;
import br.com.rinhadeconcurseiro.exception.ApelidoExistenteException;
import br.com.rinhadeconcurseiro.exception.ResourceNotFoundException;
import br.com.rinhadeconcurseiro.mapper.UsuarioMapper;
import br.com.rinhadeconcurseiro.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private UsuarioMapper usuarioMapper;

    @InjectMocks
    private UsuarioService usuarioService;

    private Usuario usuario;
    private UsuarioResponse usuarioResponse;

    @BeforeEach
    void setUp() {

        usuario = Usuario.builder()
                .id(1L)
                .googleId("google-123")
                .nome("João")
                .email("joao@email.com")
                .apelido("joaozinho")
                .ativo(true)
                .createdAt(LocalDateTime.now())
                .build();

        usuarioResponse = UsuarioResponse.builder()
                .id(1L)
                .nome("João")
                .email("joao@email.com")
                .apelido("joaozinho")
                .build();
    }

    @Test
    void deveBuscarUsuarioPorId() {

        //arrange
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(usuarioMapper.toResponse(usuario)).thenReturn(usuarioResponse);

        //act
        UsuarioResponse resultado = usuarioService.buscarPorId(1L);

        //assert
        assertThat(resultado).isNotNull();
        assertThat(resultado.id()).isEqualTo(1L);
        assertThat(resultado.nome()).isEqualTo("João");
        verify(usuarioRepository, times(1)).findById(1L);

    }

    @Test
    void deveLancarExcecaoQuandoUsuarioNaoEncontradoPorId() {
        //arrange
        when(usuarioRepository.findById(99L)).thenReturn(Optional.empty());

        //act & assert
        assertThatThrownBy(() -> usuarioService.buscarPorId(99L))
                .isInstanceOf(ResourceNotFoundException.class);
//                .hasMessageContaining("Usuário não encontrado: 99");
    }

    @Test
    void deveBuscarUsuarioPorGoogleId() {
        //arrange
        when(usuarioRepository.findByGoogleId("google-123")).thenReturn(Optional.of(usuario));
        when(usuarioMapper.toResponse(usuario)).thenReturn(usuarioResponse);

        //act
        UsuarioResponse resultado = usuarioService.buscarPorGoogleId("google-123");

        //assert
        assertThat(resultado).isNotNull();
        assertThat(resultado.email()).isEqualTo("joao@email.com");
        verify(usuarioRepository, times(1)).findByGoogleId("google-123");
    }

    @Test
    void deveLancarExcecaoQuandoUsuarioNaoEncontradoPorGoogleId() {
        //arrange
        when(usuarioRepository.findByGoogleId("google-999")).thenReturn(Optional.empty());

        //act & assert
        assertThatThrownBy(() -> usuarioService.buscarPorGoogleId("google-999"))
                .isInstanceOf(ResourceNotFoundException.class);
//                .hasMessageContaining("Usuário não encontrado: google-999");
    }

    @Test
    void deveAtualizarApelido() {
        //arrange
        UsuarioUpdateRequest request = new UsuarioUpdateRequest("novoapelido");

        Usuario usuarioAtualizado = Usuario.builder()
                .id(1L)
                .googleId("google-123")
                .nome("João")
                .email("joao@email.com")
                .apelido("novoapelido")
                .build();

        UsuarioResponse responseAtualizado = UsuarioResponse.builder()
                .id(1L)
                .nome("João")
                .email("joao@email.com")
                .apelido("novoapelido")
                .build();

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.existsByApelido("novoapelido")).thenReturn(false);
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuarioAtualizado);
        when(usuarioMapper.toResponse(usuarioAtualizado)).thenReturn(responseAtualizado);

        //act
        UsuarioResponse resultado = usuarioService.atualizarApelido(1L, request);

        //assert
        assertThat(resultado.apelido()).isEqualTo("novoapelido");
        verify(usuarioRepository, times(1)).save(any(Usuario.class));

    }

    @Test
    void devePermitirManterMesmoApelido() {
        //arrange
        UsuarioUpdateRequest request = new UsuarioUpdateRequest("joaozinho");

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.existsByApelido("joaozinho")).thenReturn(true);
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuario);
        when(usuarioMapper.toResponse(usuario)).thenReturn(usuarioResponse);

        //act
        UsuarioResponse resultado = usuarioService.atualizarApelido(1L, request);

        //assert
        assertThat(resultado.apelido()).isEqualTo("joaozinho");
        verify(usuarioRepository, times(1)).save(any(Usuario.class));
    }

    @Test
    void deveLancarExcecaoQuandoApelidoExistente() {
        //arrange
        UsuarioUpdateRequest request = new UsuarioUpdateRequest("apelidoexistente");

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.existsByApelido("apelidoexistente")).thenReturn(true);

        //act & assert
        assertThatThrownBy(() -> usuarioService.atualizarApelido(1L, request))
                .isInstanceOf(ApelidoExistenteException.class)
                .hasMessageContaining("Apelido já existe: apelidoexistente");
    }

    @Test
    void deveAtualizarUltimoAcesso() {
        //arrange
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuario);

        //act
        usuarioService.atualizarUltimoAcesso(1L);

        //assert
        verify(usuarioRepository, times(1)).save(any(Usuario.class));
        assertThat(usuario.getUltimoAcesso()).isNotNull();
    }

    @Test
    void deveLancarExcecaoAoAtualizarAcessoDeUsuarioInexistente() {
        //arrange
        when(usuarioRepository.findById(99L)).thenReturn(Optional.empty());

        //act & assert
        assertThatThrownBy(()-> usuarioService.atualizarUltimoAcesso(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
