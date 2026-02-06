package br.com.rinhadeconcurseiro.repository;

import br.com.rinhadeconcurseiro.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByGoogleId(String googleId);

    Optional<Usuario> findByEmail(String email);

    boolean existsByApelido(String apelido);
}
