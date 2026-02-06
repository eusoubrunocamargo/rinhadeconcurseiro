package br.com.rinhadeconcurseiro.repository;

import br.com.rinhadeconcurseiro.entity.Usuario;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class UsuarioRepositoryTest {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Test
    void deveSalvarUsuario() {

        //arrange
        Usuario usuario = Usuario.builder()
                .googleId("google-123")
                .nome("Silva")
                .email("silva@gmail.com")
                .build();

        //act
        Usuario salvo = usuarioRepository.save(usuario);

        //assert
        assertThat(salvo.getId()).isNotNull();
        assertThat(salvo.getGoogleId()).isNotNull();
        assertThat(salvo.getCreatedAt()).isNotNull();
    }

    @Test
    void deveBuscarPorGoogleId() {

        //arrange
        Usuario usuario = Usuario.builder()
                .googleId("google-123")
                .nome("Silva")
                .email("silva@gmail.com")
                .build();
        usuarioRepository.save(usuario);

        //act
        Optional<Usuario> encontrado = usuarioRepository.findByGoogleId("google-123");

        //assert
        assertThat(encontrado).isPresent();
        assertThat(encontrado.get().getNome()).isEqualTo("Silva");
    }

    @Test
    void deveBuscarPorEmail() {

        //arrange
        Usuario usuario = Usuario.builder()
                .googleId("google-123")
                .nome("Silva")
                .email("silva@email.com")
                .build();
        usuarioRepository.save(usuario);

        //act
        Optional<Usuario> encontrado = usuarioRepository.findByEmail("silva@email.com");

        //assert
        assertThat(encontrado).isPresent();
        assertThat(encontrado.get().getGoogleId()).isEqualTo("google-123");
    }

    @Test
    void deveVerificarApelidoExistente() {

        //arrange
        Usuario usuario = Usuario.builder()
                .googleId("google-123")
                .nome("Silva")
                .email("silva@email.com")
                .apelido("silvinha")
                .build();
        usuarioRepository.save(usuario);

        //act & assert
        assertThat(usuarioRepository.existsByApelido("silvinha")).isTrue();
        assertThat(usuarioRepository.existsByApelido("outro")).isFalse();
    }
}
